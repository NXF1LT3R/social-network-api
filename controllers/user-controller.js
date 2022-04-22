const { User } = require('../models');

const userController = {

  getAllUsers(req, res) {
    User.find({})
      .populate({
        path: 'thoughts',
        select: '-__v'
      })
      .select('-__v')
      .sort({ _id: -1 })
      .then(dbUserData => res.json(dbUserData))
      .catch(err => {
        console.log(err);
        res.sendStatus(400);
      });
  },

  getUserById({ params }, res) {
    User.findOne({ _id: params.userId })
      .populate({
        path: 'thoughts',
        select: '-__v'
      })
      .select('-__v')
      .then(dbUserData => res.json(dbUserData))
      .catch(err => {
        console.log(err);
        res.sendStatus(400);
      });
  },

  createUser({ body }, res) {
    User.create(body)
      .then(dbUserData => res.json(dbUserData))
      .catch(err => res.json(err));
  },

  addFriend({ params }, res) {
    console.log(params);
    User.findOne({
      username: params.friendId
    })
      .then(({ username, _id }) => {
        console.log("Found friend as %s with id %s", username, _id)
        console.log("Setting friend to" + username)
        return User.findOneAndUpdate(
          { username: params.userId },
          { $addToSet: { friends: _id } },
          { new: true }
        );
      })
      .then(( user )=> {
        console.log("Found friend as %s with id %s", user.username, user._id)
        console.log("Setting friend to" + user.username)
        return User.findOneAndUpdate(
          { username: params.friendId },
          { $addToSet: { friends: user._id } },
          { new: true }
        );
      }) .then(user => {
        return User.findOne(
          {username: params.userId}
        )
      })
      .then(dbUserData => {
        console.log(dbUserData);
        if (!dbUserData) {
          res.status(404).json({ message: 'No user found with this id!' });
          return;
        }
        res.json(dbUserData);
      })
      .catch(err => res.json(err));
  },


  updateUser({ params, body }, res) {
    User.findOneAndUpdate({ _id: params.userId }, body, { new: true, runValidators: true })
      .then(dbUserData => {
        if (!dbUserData) {
          res.status(404).json({ message: 'No user found with this id!' });
          return;
        }
        res.json(dbUserData);
      })
      .catch(err => res.json(err));
  },

  deleteUser({ params }, res) {
    User.findOneAndDelete({ _id: params.userId })
      .then(dbUserData => res.json(dbUserData))
      .catch(err => res.json(err));
  },

  removeFriend({ params }, res) {
    User.findOneAndUpdate(
      { _id: params.userId },
      { $pullAll: { friends: [ params.friendId ] } },
      { new: true }
    ) .then(user => {
      return User.findOneAndUpdate(
        { _id: params.friendId },
        { $pullAll: { friends: [ params.userId ] } },
        { new: true }
      )
    }) .then( user =>{
      return User.findOne(
        {_id: params.userId}
      )
    })
      .then(dbUserData => res.json(dbUserData))
      .catch(err => res.json(err));
  }
};

module.exports = userController;
