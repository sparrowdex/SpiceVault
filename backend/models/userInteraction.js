// models/userInteraction.js

module.exports = (sequelize, DataTypes) => {
  const UserInteraction = sequelize.define('UserInteraction', {
    interaction_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user',
        key: 'user_id'
      }
    },
    recipe_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Recipe',
        key: 'recipe_id'
      }
    },
    interaction_type: {
      type: DataTypes.ENUM('view', 'like', 'save', 'share', 'cook'),
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    duration: {
      type: DataTypes.INTEGER, // in seconds
      allowNull: true
    }
  }, {
    tableName: 'user_interactions',
    timestamps: false,
    indexes: [
      {
        fields: ['user_id', 'interaction_type']
      },
      {
        fields: ['recipe_id', 'interaction_type']
      }
    ]
  });

  return UserInteraction;
};
