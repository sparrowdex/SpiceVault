'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    user_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    f_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    l_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    profile_picture: {
      type: DataTypes.STRING
    },
    date_joined: {
      type: DataTypes.DATEONLY
    },
    user_type: {
      type: DataTypes.STRING
    },
    house_number: {
      type: DataTypes.INTEGER
    },
    street_number: {
      type: DataTypes.STRING
    },
    city: {
      type: DataTypes.STRING
    },
    state: {
      type: DataTypes.STRING
    },
    pincode: {
      type: DataTypes.STRING
    }
  }, {
    tableName: 'user',
    timestamps: false
  });

  return User;
};
