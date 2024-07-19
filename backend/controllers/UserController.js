const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const jwtSecret = process.env.JWT_SECRET;

/* Gerador de token do usuário */
const generateToken = (id) => {
  return jwt.sign({ id }, jwtSecret, { expiresIn: "7d" });
};

/* Registrar e logar usuário */
const register = async (req, res) => {
  const { name, email, password } = req.body;

  /* Checar se usuário existe */
  const user = await User.findOne({ email });

  if (user) {
    res.status(422).json({ errors: ["Por favor, utilize outro e-mail"] });
    return;
  }

  /* Gerar hash de senha */
  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash(password, salt);

  /* Criar usuário */
  const newUser = await User.create({
    name,
    email,
    password: passwordHash,
  });

  /* Checar se usuário foi criado */
  if (!newUser) {
    res
      .status(422)
      .json({ errors: ["Houve um erro, por favor tente mais tarde"] });
    return;
  }

  /* Gerar token do usuário */
  res.status(201).json({ _id: newUser._id, token: generateToken(newUser._id) });
};

/* Logar usuário */
const login = async (req, res) => {
  const { email, password } = req.body;

  /* Checar se usuário existe */
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404).json({ errors: ["Usuário não encontrado"] });
    return;
  }

  /* Checar senha do usuário */
  if (!(await bcrypt.compare(password, user.password))) {
    res.status(422).json({ errors: ["Senha inválida"] });
    return;
  }

  /* Gerar token do usuário */
  res.status(201).json({
    _id: user._id,
    profileImage: user.profileImage,
    token: generateToken(user._id),
  });
};

/* Pegar logado usuário */

const getCurrentUser = async (req, res) => {
  const user = req.user;
  res.status(200).json(user);
};

/* Atualizar usuário */
const update = async (req, res) => {
  const { name, password, bio } = req.body;

  let profileImage = null;

  if (req.file) {
    profileImage = req.file.filename;
  }

  const reqUser = req.user;

  const user = await User.findById(
    new mongoose.Types.ObjectId(reqUser._id)
  ).select("-password");

  if (name) {
    user.name = name;
  }

  if (password) {
    /* Gerar hash de senha */
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    user.password = passwordHash;
  }

  if (profileImage) {
    user.profileImage = profileImage;
  }

  if (bio) {
    user.bio = bio;
  }

  await user.save();
  res.status(200).json(user);
};

/* Pegar usuário pelo ID */
const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(new mongoose.Types.ObjectId(id)).select(
      "-password"
    );

    if (!user) {
      res.status(404).json({ erros: "Usuário não encontrado" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ erros: "Usuário não encontrado" });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  update,
  getUserById,
};
