const {
  addPanelDoc,
  getDocs,
  updatePanelDoc,
  deletePanelDoc,
} = require("../crud");
const bcrypt = require("bcrypt");
const { sendEmail, sendUserEmail } = require("../utils/emails");

exports.editUserEmail = async (req, res) => {
  const { uid, email, panel_id } = req.body;

  if (!email || !uid) {
    return res.status(400).json({ error: "Missing email or user uid" });
  }

  const updateUserEmail = async () => {
    try {
      await updatePanelDoc("users", uid, { email: email }, panel_id);
      return res.status(200).send({ code: "update-success" });
    } catch (error) {}
  };
  updateUserEmail();
};

exports.authenticate = async (req, res) => {
  const { email, password, panel_id } = req.body;
  const user = await getDocs("users", panel_id, {
    find: { field: "email", operator: "===", value: email },
  });
  if (!user) {
    return res.status(400).send({ error: "Incorrect Login Details" });
  }
  if (user.status === "banned") {
    return res.status(400).send({
      error:
        "You've been banned from this site. Kindly contact support for more info",
    });
  }
  const isMatch = bcrypt.compare(password, user.password);
  if (isMatch) {
    return res
      .status(200)
      .send({ success: "Logged In Successfully", user: user });
  } else {
    return res.status(400).send({ error: "Incorrect Login Details" });
  }
};

exports.adminAuthentication = async (req, res) => {
  const { email, password, panel_id } = req.body;
  const admin = await getDocs("admins", panel_id, {
    find: { field: "email", operator: "===", value: email },
  });
  if (!admin) {
    return res.status(400).send({ error: "Incorrect Login Details" });
  }
  const isMatch = bcrypt.compare(password, admin.password);
  if (isMatch) {
    return res
      .status(200)
      .send({ success: "Logged In Successfully", admin: admin });
  } else {
    return res.status(400).send({ error: "Incorrect Login Details" });
  }
};

exports.editUserPassword = async (req, res) => {
  const { uid, password, key, panel_id } = req.body;

  if (!password || !uid || !key) {
    return res.status(400).json({ error: "Missing password, key or user uid" });
  }

  const allAdmins = await getDocs("admins", panel_id);
  const adminSnapshot = allAdmins.some((admin) => admin.api_key === key);

  if (!adminSnapshot) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  const updateUserpassword = async () => {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await updatePanelDoc(
        "users",
        uid,
        { password: hashedPassword },
        panel_id
      );
      return res.status(200).send({ code: "update-success" });
    } catch (error) {}
  };
  updateUserpassword();
};

exports.deleteUser = async (req, res) => {
  const { uid, panel_id } = req.body;

  if (!uid) {
    return res.status(400).json({ error: "Missinguser uid" });
  }

  const deleteUser = async () => {
    try {
      await deletePanelDoc("users", uid, panel_id);
      return res.status(200).send({ code: "update-success" });
    } catch (error) {}
  };
  deleteUser();
};

exports.updateUserBalance = async (req, res) => {
  const {
    selectedUser,
    balanceAction,
    balanceInput,
    updatedBalance,
    key,
    panel_id,
  } = req.body;

  if (!selectedUser || !balanceAction || !balanceInput || !key) {
    return res.status(400).json({ error: "Missing some fields" });
  }

  const allAdmins = await getDocs("admins", panel_id);
  const adminSnapshot = allAdmins.some((admin) => admin.api_key === key);

  if (!adminSnapshot) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  const updateBalance = async () => {
    try {
      await updatePanelDoc(
        "users",
        selectedUser.uid,
        { balance: updatedBalance },
        panel_id
      );
      const newTrans = {
        user_id: selectedUser.uid,
        balanceAction: balanceAction,
        status: "success",
        amount: balanceInput,
        payment_method: "Manual",
        timestamp: new Date(),
      };
      await addPanelDoc("transactions", newTrans, panel_id);
      return res.status(200).send("Balance Updated Successfully");
    } catch (error) {
      res.status(400).json({ error: error });
    }
  };
  updateBalance();
};

exports.createUser = async (req, res) => {
  const { panel_id, email, username, ref, password } = req.body;

  if (!panel_id) {
    return res
      .status(400)
      .json({ error: "Missing email, key, username or password" });
  }
  try {
    const allUsers = await getDocs("users", panel_id);
    const hashedPassword = await bcrypt.hash(password, 10);
    req.body.password = hashedPassword;
    const emailExists = allUsers.some((user) => user.email === email);
    const usernameExists = allUsers.some((user) => user.username === username);
    if (emailExists) {
      return res.status(400).send({ error: "Email already exists" });
    }
    if (usernameExists) {
      return res.status(400).send({ error: "Username already exists" });
    }
    if (ref) {
      await addPanelDoc(
        "referrals",
        { username: username, user_id: parseInt(ref) },
        panel_id
      );
    }
    await addPanelDoc("users", { ...req.body }, panel_id);

    await sendEmail(undefined, "new_user", { ...req.body }, panel_id);
    return res.status(200).send({ success: "Created Successfully" });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  const { panel_id } = req.body;

  if (!panel_id) {
    return res.status(400).json({ error: "Missing id" });
  }
  const allUsers = await getDocs("users", panel_id);
  return res.status(200).send(allUsers);
};

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.sendForgetPasswdCode = async (req, res) => {
  const { email, panel_id } = req.body;

  if (!panel_id || !email) {
    return res.status(400).json({ error: "Missing panel_id or Email" });
  }
  const verification_code = generateVerificationCode();
  try {
    const user = await getDocs("users", panel_id, {
      find: { field: "email", operator: "===", value: email },
    });
    if (!user) {
      return res.status(400).send({ error: "User Doesn't Exist" });
    }
    const general = await getDocs("general", panel_id, {
      find: { field: "uid", operator: "===", value: "site" },
    });
    await sendUserEmail(
      `${general.title} <contact@validpanel.com>`,
      email,
      "verification_code",
      {
        company: general.title,
        username: user.username,
        verification_code: verification_code,
      },
      panel_id
    );
    await addPanelDoc(
      "verification_codes",
      {
        code: parseInt(verification_code),
        type: "forgotPassword",
        email: email,
        timestamp: new Date(),
      },
      panel_id
    );
    return res.status(200).send({ success: "Sent Successfully" });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

exports.confirmForgetPasswdCode = async (req, res) => {
  const { code, panel_id, email } = req.body;

  if (!panel_id || !code || !email) {
    return res.status(400).json({ error: "Missing panel_id,email or code" });
  }

  try {
    // Fetch all verification codes for the given panel_id
    const verificationCodes = await getDocs("verification_codes", panel_id, {
      filter: { field: "type", operator: "===", value: "forgotPassword" },
    });

    if (verificationCodes.length === 0) {
      return res.status(404).json({ error: "No verification codes found" });
    }

    verificationCodes.filter((code) => code.email === email);

    // Sort the array based on the timestamp, newest first
    verificationCodes.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    // Get the most recent verification code
    const latestCodeEntry = verificationCodes[0];

    if (latestCodeEntry.code === code) {
      return res.status(200).json({ success: "Code verified successfully" });
    } else {
      return res.status(400).json({ error: "Invalid or expired code" });
    }
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { code, panel_id, password, email } = req.body;

  if (!panel_id || !code || !email) {
    return res.status(400).json({ error: "Missing panel_id, email or code" });
  }

  try {
    const user = await getDocs("users", panel_id, {
      find: { field: "email", operator: "===", value: email },
    });
    // Fetch all verification codes for the given panel_id
    const verificationCodes = await getDocs("verification_codes", panel_id, {
      filter: { field: "type", operator: "===", value: "forgotPassword" },
    });

    if (verificationCodes.length === 0) {
      return res.status(404).json({ error: "No verification codes found" });
    }
    verificationCodes.filter((code) => code.email === email);

    // Sort the array based on the timestamp, newest first
    verificationCodes.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    // Get the most recent verification code
    const latestCodeEntry = verificationCodes[0];
    const hashedPassword = await bcrypt.hash(password, 10);
    if (latestCodeEntry.code === code) {
      await updatePanelDoc(
        "users",
        user.uid,
        { password: hashedPassword },
        panel_id
      );
      return res.status(200).json({ success: "Reset successfully" });
    } else {
      return res.status(400).json({ error: "Invalid or expired code" });
    }
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};
