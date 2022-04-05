const Sauce = require("../models/Sauce");
const fs = require("fs");
const { findOne } = require("../models/Sauce");

exports.createSauce = (req, res, next) => {
  // Transformation de la chaîne de caractères en objet
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  // Création de l'objet et récupération de l'url de l'image qui a été créé par multer
  const sauce = new Sauce({
    ...sauceObject,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce enregistrée" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  // Si il y a un fichier
  if (req.file) {
    // Suppression de l'ancienne image
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, (error) => {
          if (error) throw error;
        });
      })
      .catch((error) => res.status(404).json({ error }));
  } else {
    // Si il n'y a pas de fichier
    console.log("aucun fichier");
  }

  // Récupération des données reçues
  const sauceObject = req.file
    ? {
        // Si il y a une image
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : {
        // Si il n'y a pas d'image
        ...req.body,
      };

  // Mise à jour de la base de données
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() => {
      res.status(200).json({ message: "La sauce a bien été modifiée" });
    })
    .catch((error) => res.status(400).json({ error }));

  return console.log("Sauce modifiée");
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce supprimée" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

exports.likeSauce = (req, res, next) => {
  const like = req.body.like;
  // Like
  if (like == 1) {
    // Ajout de 1 aux likes et de l'userId à usersLiked
    Sauce.updateOne(
      { _id: req.params.id },
      { $inc: { likes: 1 }, $addToSet: { usersLiked: req.body.userId } }
    )
      .then(() => {
        res.status(200).json({ message: "Like comptabilisé" });
      })
      .catch((error) => res.status(400).json({ error }));
    return console.log("Like comptabilisé");
  }
  // Like/Dislike mis à 0
  if (like == 0) {
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        // Si l'utilisateur a précédemment liké la sauce
        if (sauce.usersLiked.includes(req.body.userId)) {
          Sauce.updateOne(
            { _id: req.params.id },
            { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } }
          )
            .then(() => {
              res.status(200).json({ message: "Likes mis à zéro" });
            })
            .catch((error) => res.status(400).json({ error }));
        }
        // Si l'utilisateur a précédemment disliké la sauce
        else if (sauce.usersDisliked.includes(req.body.userId)) {
          console.log("user disliked");
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { dislikes: -1 },
              $pull: { usersDisliked: req.body.userId },
            }
          )
            .then(() => {
              res.status(200).json({ message: "Dislikes mis à zéro" });
            })
            .catch((error) => res.status(400).json({ error }));
        } else {
          res.status(404).json({ message: "Aucun avis trouvé" });
        }
      })
      .catch((error) => res.status(404).json({ error }));
    return console.log("Mise à zéro des likes/dislikes comptabilisée");
  }
  // Dislike
  if (like == -1) {
    // Ajout de 1 aux dislikes et de l'userId à usersDisliked
    Sauce.updateOne(
      { _id: req.params.id },
      { $inc: { dislikes: 1 }, $addToSet: { usersDisliked: req.body.userId } }
    )
      .then(() => {
        res.status(200).json({ message: "Dislike comptabilisé" });
      })
      .catch((error) => res.status(400).json({ error }));
    return console.log("Dislike comptabilisé");
  }
};
