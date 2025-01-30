const mongoose = require("mongoose")

const credentialSchema = new mongoose.Schema({
    id: String,
    email: String,
    image: String,
    name: String,
    provider: String,
    accountVerified: Boolean,
    hashedPassword: String,
})

module.exports = mongoose.model("Credential", credentialSchema)

