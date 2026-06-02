const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  title: { type: String, required: true },
  audioUrl: { type: String, required: true }
});
const Model = mongoose.model('Test', schema);
const doc = new Model({ title: "", audioUrl: "" });
const err = doc.validateSync();
console.log(err ? err.message : "Passed");
