import Campaign from "../models/Campaign.js";
import { createTransporter, verifyTransporter } from "../services/mailService.js";
import { validateEmailList } from "../services/emailVerifier.js";


function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

const processCampaignSend = async (campaign) => {
  let freshCampaign;

  try {
    freshCampaign = await Campaign.findById(campaign._id);
    if (!freshCampaign) {
      console.error(`Campaign ${campaign._id} not found`);
      return;
    }
    freshCampaign.status = 'sending';
    await freshCampaign.save();

    const { message, subject, emails } = campaign;
    const transporter = createTransporter();
    const fromAddress = process.env.EMAIL_FROM || 'noreply@yourdomain.com';

    const results = [];
    const batchSize = Number(process.env.EMAIL_BATCH_SIZE || 20);
    const chunks = chunkArray(emails, batchSize);

    for (const chunk of chunks) {
      console.log(`Sending batch of ${chunk.length} emails for campaign ${campaign._id}`);
      const batchResults = await Promise.all(
        chunk.map((email) =>
          transporter.sendMail({
              to: email,
              from: fromAddress,
              subject,
              text: message,
            })
            .then((info) => {
              console.log(`Email sent to ${email}: success`);
              return { email, status: "success", info };
            })
            .catch((err) => {
              console.error(`Email failed to ${email}:`, err.message);
              return { email, status: "failed", error: err.message };
            })
        )
      );

      results.push(...batchResults);

      if (process.env.EMAIL_BATCH_DELAY_MS) {
        const delayMs = Number(process.env.EMAIL_BATCH_DELAY_MS);
        console.log(`Waiting ${delayMs}ms before next batch`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    const successCount = results.filter((r) => r.status === "success").length;
    freshCampaign.results = results;
    freshCampaign.status = successCount === 0 ? 'failed' : (successCount === freshCampaign.totalEmails ? 'sent' : 'partial');
    freshCampaign.sentAt = new Date();
    await freshCampaign.save();

    console.log(`Campaign ${campaign._id} completed: ${successCount}/${campaign.totalEmails}`);
    return { successCount, total: campaign.totalEmails, results, status: successCount === 0 ? 'failed' : (successCount === campaign.totalEmails ? 'sent' : 'partial') };
  } catch (error) {
    if (freshCampaign) {
      freshCampaign.status = 'failed';
      await freshCampaign.save();
    }
    console.error('processCampaignSend error:', error);
    throw error;
  }
};

export const scheduleCampaign = async (req, res) => {
  try {
    const { msg, submsg, emaillist, scheduledAt } = req.body;

    if (!msg || !submsg || !emaillist || !Array.isArray(emaillist) || emaillist.length === 0) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const {
      validEmails,
      invalidEmails,
      verificationError,
      verificationWarning,
    } = await validateEmailList(emaillist);

    if (verificationError) {
      return res.status(400).json({
        success: false,
        message: `ZeroBounce verification failed: ${verificationError}`,
      });
    }

    // CRITICAL RULE: If any invalid emails are found, stop immediately
    if (invalidEmails.length > 0) {
      console.log("⛔ STOPPED - INVALID OR NON-EXISTENT EMAILS FOUND");
      return res.status(400).json({
        success: false,
        message: "Invalid email(s) detected",
        invalidEmails
      });
    }

    if (validEmails.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid emails found in the uploaded list",
      });
    }

    const campaign = await Campaign.create({
      subject: submsg,
      message: msg,
      emails: validEmails, // Store only valid emails in the campaign
      totalEmails: validEmails.length,
      status: scheduledAt ? 'scheduled' : 'pending',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      user: req.user._id
    });

    if (!scheduledAt) {
      // Immediate send (old "send now" behavior)
      console.log("SENDING EMAILS NOW...");
      const result = await processCampaignSend(campaign);
      const sentCount = result.successCount;
      return res.json({
        success: true,
        message: `Campaign completed: ${sentCount}/${validEmails.length} delivered`,
        campaignId: campaign._id,
        verificationWarning,
      });
    }

    res.json({
      success: true,
      message: `Campaign scheduled for ${new Date(scheduledAt).toLocaleString()}`,
      campaignId: campaign._id,
      verificationWarning,
    });
  } catch (error) {
    console.error("Schedule error:", error);
    res.status(500).json({ message: "Failed to schedule campaign", error: error.message });
  }
};

export const retryCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign || campaign.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    if (campaign.status === 'sent') {
      return res.status(400).json({ message: "Cannot retry sent campaign" });
    }

    await processCampaignSend(campaign);
    res.json({ success: true, message: "Campaign retry started" });
  } catch (error) {
    res.status(500).json({ message: "Retry failed", error: error.message });
  }
};

export const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign || campaign.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    await Campaign.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Campaign deleted permanently" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

export const sendMail = async (req, res) => {
  // Backward compatibility - call scheduleCampaign without scheduledAt
  req.body.scheduledAt = null;
  await scheduleCampaign(req, res);
};

export const verifyMailSetup = async (req, res) => {
  try {
    await verifyTransporter();
    return res.json({ ok: true, message: "Mail setup verified" });
  } catch (error) {
    console.error("Mail setup verify failed:", error);
    return res.status(500).json({ ok: false, error: error.message });
  }
};
export { processCampaignSend };
