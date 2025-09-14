// models/rating.js - Using your existing Reviews_Given table

module.exports = (sequelize, DataTypes) => {
  const Rating = sequelize.define('Rating', {
    review_id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    recipe_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Recipe',
        key: 'recipe_id'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'user_id'
      }
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    review_text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    datestamp: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    tableName: 'reviews_given',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'recipe_id']
      }
    ]
  });

  return Rating;
};
