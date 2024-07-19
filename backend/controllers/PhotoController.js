const Photo = require("../models/Photo");
const User = require("../models/User");
const mongoose = require("mongoose");

/* Inserir foto, com usuário relacionado */
const insertPhoto = async (req, res) => {
  const { title } = req.body;
  const image = req.file.filename;

  const reqUser = req.user;

  const user = await User.findById(reqUser._id);

  /* Criar a foto */
  const newPhoto = await Photo.create({
    image,
    title,
    userId: user._id,
    userName: user.name,
  });

  /* Se a foto foi criada corretamente, retorne a data */

  if (!newPhoto) {
    res.status(422).json({
      errors: ["Houve um problema, por favor tente novamente mais tarde"],
    });
    return;
  }

  res.status(201).json(newPhoto);
};

const deletePhoto = async (req, res) => {
  const { id } = req.params;
  const reqUser = req.user;

  try {
    const photo = await Photo.findById(new mongoose.Types.ObjectId(id));

    if (!photo) {
      res.status(404).json({
        errors: ["Foto não encontrada"],
      });
      return;
    }

    /* Verificar se a foto pertence ao usuário */
    if (!photo.userId.equals(reqUser._id)) {
      res.status(422).json({
        errors: ["Houve um problema, por favor tente novamente mais tarde"],
      });
    }

    await Photo.findByIdAndDelete(photo._id);

    res
      .status(200)
      .json({ id: photo._id, message: "Foto excluída com sucesso" });
  } catch (error) {
    res.status(404).json({
      errors: ["Foto não encontrada"],
    });
    return;
  }
};

/* Pegar todas as fotos */
const getAllPhotos = async (req, res) => {
  const photos = await Photo.find({})
    .sort([["createdAt", -1]])
    .exec();

  res.status(200).json(photos);
};

/* Pegar fotos do usuário */
const getUserPhotos = async (req, res) => {
  const { id } = req.params;
  const photos = await Photo.find({ userId: id })
    .sort([["createdAt", -1]])
    .exec();

  return res.status(200).json(photos);
};

/* Pegar foto pelo ID */
const getPhotoById = async (req, res) => {
  const { id } = req.params;
  const photo = await Photo.findById(new mongoose.Types.ObjectId(id));

  /* Verificar se foto existe */
  if (!photo) {
    res.status(404).json({
      errors: ["Foto não encontrada"],
    });
    return;
  }

  res.status(200).json(photo);
};

/* Editar foto */
const updatePhoto = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  const reqUser = req.user;

  const photo = await Photo.findById(id);

  /* Verificar se foto existe */
  if (!photo) {
    res.status(404).json({
      errors: ["Foto não encontrada"],
    });
    return;
  }

  /* Checar se a foto pertence ao usuário que está requerindo */
  if (!photo.userId.equals(reqUser._id)) {
    res.status(422).json({
      errors: ["Ocorreu um erro, por favor tente novamente mais tarde"],
    });
    return;
  }

  if (title) {
    photo.title = title;
  }

  await photo.save();

  res.status(200).json({ photo, message: "Foto atualizada com sucesso" });
};

/* Funcionalidade de Like */
const likePhoto = async (req, res) => {
  const { id } = req.params;

  const reqUser = req.user;

  const photo = await Photo.findById(id);

  /* Verificar se foto existe */
  if (!photo) {
    res.status(404).json({
      errors: ["Foto não encontrada"],
    });
    return;
  }

  /* Checar se usuário já deu like */
  if (photo.likes.includes(reqUser._id)) {
    res.status(422).json({
      errors: ["Você já curtiu a foto"],
    });
    return;
  }

  /* Colocar o ID do usuário no Array de likes */
  photo.likes.push(reqUser._id);

  photo.save();

  res
    .status(200)
    .json({ photoId: id, userId: reqUser._id, message: "A foto foi curtida" });
};

/* Funcionalidade de comentário */
const commentPhoto = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  const reqUser = req.user;

  const user = await User.findById(reqUser._id);
  const photo = await Photo.findById(id);

  /* Verificar se foto existe */
  if (!photo) {
    res.status(404).json({
      errors: ["Foto não encontrada"],
    });
    return;
  }

  /* Colocar o ID do usuário no Array de comentários */
  const userComment = {
    comment,
    userName: user.name,
    userImage: user.profileImage,
    userId: user._id,
  };

  photo.comments.push(userComment);

  await photo.save();

  res.status(200).json({
    comment: userComment,
    message: "O comentário foi adicionado com sucesso",
  });
};

/* Procurar foto pelo título */
const searchPhotos = async (req, res) => {
  const { q } = req.query;

  const photos = await Photo.find({ title: new RegExp(q, "i") }).exec();

  res.status(200).json(photos);
};

module.exports = {
  insertPhoto,
  deletePhoto,
  getAllPhotos,
  getUserPhotos,
  getPhotoById,
  updatePhoto,
  likePhoto,
  commentPhoto,
  searchPhotos,
};
