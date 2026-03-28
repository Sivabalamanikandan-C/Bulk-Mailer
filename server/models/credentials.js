import mongoose from "mongoose";

const credentialsSchema = new mongoose.Schema({}, { strict: false });

const Credentials = mongoose.model("credentials", credentialsSchema, "bulkmail");

export default Credentials;
