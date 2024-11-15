import express from 'express';
import asyncHandler from 'express-async-handler';
// import Category from '../Models/CategorySchema.JS';
import Category from '../Models/CategorySchema.js';

const CategoryRoute = express.Router();

// Route pour créer une nouvelle catégorie
CategoryRoute.post(
  '/',
  asyncHandler(async (req, res) => {
    const category = new Category(req.body);
    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  })
);

// Route pour obtenir toutes les catégories
CategoryRoute.get(
  '/',
  asyncHandler(async (req, res) => {
    const categories = await Category.find({});
    res.json(categories);
  })
);

// Route pour obtenir une catégorie par ID
CategoryRoute.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  })
);

// Route pour mettre à jour une catégorie par ID
CategoryRoute.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (category) {
      category.nom = req.body.nom || category.nom;
      category.unite = req.body.unite || category.unite;
      category.piecenombre = req.body.piecenombre || category.piecenombre;
      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  })
);

// Route pour supprimer une catégorie par ID
CategoryRoute.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (category) {
      await category.remove();
      res.json({ message: 'Category removed' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  })
);

export default CategoryRoute;
