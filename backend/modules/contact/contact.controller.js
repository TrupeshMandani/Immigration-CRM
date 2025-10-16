const Student = require("../../models/Student");

// Submit contact form
exports.submitContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    // Check if contact already exists
    const existingContact = await Student.findOne({
      "contactInfo.email": email,
      status: "pending",
    });

    if (existingContact) {
      return res
        .status(400)
        .json({ message: "Contact request already submitted" });
    }

    // Create pending student record
    const student = new Student({
      aiKey: `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: "pending",
      contactInfo: {
        name,
        email,
        phone,
        message,
      },
    });

    await student.save();

    res.status(201).json({
      message: "Contact request submitted successfully",
      contactId: student._id,
    });
  } catch (error) {
    console.error("Contact submission error:", error);
    res.status(500).json({ message: "Failed to submit contact request" });
  }
};
