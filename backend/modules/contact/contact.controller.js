const Student = require("../../models/Student");
const { sendEmail } = require("../../utils/sendEmail");
const {
  ADMIN_NOTIFICATIONS_EMAIL,
  APP_BASE_URL,
} = require("../../config/env");

// Submit contact form
exports.submitContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if contact already exists
    const existingContact = await Student.findOne({
      "contactInfo.email": normalizedEmail,
      status: "pending",
    });

    if (existingContact) {
      return res
        .status(400)
        .json({ message: "Contact request already submitted" });
    }

    // Prevent duplicate accounts for the same email
    const existingStudent = await Student.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedEmail }],
      status: { $ne: "inactive" },
    });

    if (existingStudent) {
      return res.status(400).json({
        message:
          "An account with this email already exists. Please use the login option.",
      });
    }

    // Create pending student record
    const student = new Student({
      aiKey: `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: "pending",
      contactInfo: {
        name,
        email: normalizedEmail,
        phone,
        message,
      },
    });

    await student.save();

    if (ADMIN_NOTIFICATIONS_EMAIL) {
      try {
        const portalLink = `${APP_BASE_URL.replace(/\/$/, "")}/admin/requests`;
        await sendEmail({
          to: ADMIN_NOTIFICATIONS_EMAIL,
          subject: "New Immigration CRM contact request",
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
              <h2 style="color:#1d4ed8;margin-bottom:12px;">New contact submitted</h2>
              <p style="margin:0 0 16px 0;">
                A prospective student just submitted their details through the website contact form.
              </p>
              <div style="background:#f1f5f9;border-radius:8px;padding:16px;margin-bottom:16px;">
                <p style="margin:0;"><strong>Name:</strong> ${name}</p>
                <p style="margin:8px 0 0 0;"><strong>Email:</strong> ${normalizedEmail}</p>
                ${
                  phone
                    ? `<p style="margin:8px 0 0 0;"><strong>Phone:</strong> ${phone}</p>`
                    : ""
                }
                ${
                  message
                    ? `<p style="margin:16px 0 0 0;"><strong>Notes:</strong><br/>${message.replace(
                        /\n/g,
                        "<br/>"
                      )}</p>`
                    : ""
                }
              </div>
              <p style="margin-bottom:16px;">
                Review and approve this request in the admin portal to trigger the onboarding email.
              </p>
              <a href="${portalLink}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:6px;">Open Contact Requests</a>
            </div>
          `,
        });
      } catch (notifyError) {
        console.error("Failed to send admin contact notification:", notifyError);
      }
    }

    res.status(201).json({
      message: "Contact request submitted successfully",
      contactId: student._id,
    });
  } catch (error) {
    console.error("Contact submission error:", error);
    res.status(500).json({ message: "Failed to submit contact request" });
  }
};
