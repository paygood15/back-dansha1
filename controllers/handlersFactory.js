const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const ApiFeatures = require('../utils/apiFeatures');

const setImageUrl = (doc) => {
  if (doc.imageCover) {
    const imageCoverUrl = `${process.env.BASE_URL}/products/${doc.imageCover}`;
    doc.imageCover = imageCoverUrl;
  }
  if (doc.images) {
    const images = [];
    doc.images.forEach((image) => {
      const imageUrl = `${process.env.BASE_URL}/products/${image}`;
      images.push(imageUrl);
    });
    doc.images = images;
  }
    // Include titleAr if it exists
  if (doc.titleAr) {
    doc.titleAr = doc.titleAr;
  }
};

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document) {
      next(
        new ApiError(`No document found for this id: ${req.params.id}`, 404)
      );
    }
    // To trigger 'remove' event when delete document
    document.remove();
    // 204 no content
    res.status(204).send();
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    // Fetch the existing document
    const existingDocument = await Model.findById(req.params.id);

    if (!existingDocument) {
      return next(new ApiError(`No document found for this id: ${req.params.id}`, 404));
    }

    // Merge existing document data with the new data, handling image fields
    const updateData = { ...req.body };
    if (!updateData.imageCover) {
      // If imageCover is empty, retain the existing value
      updateData.imageCover = existingDocument.imageCover;
    }
    if (!updateData.images) {
      // If images is empty, retain the existing array
      updateData.images = existingDocument.images;
    }

    // Perform the update with merged data
    const document = await Model.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    // To trigger 'save' event when update document
    const doc = await document.save();

    if (doc.constructor.modelName === 'Product') {
      setImageUrl(doc);
    }
    res.status(200).json({ data: doc });
  });

exports.createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const newDoc = await Model.create(req.body);

    if (newDoc.constructor.modelName === 'Product') {
      setImageUrl(newDoc);
    }
    res.status(201).json({ data: newDoc });
  });

exports.getOne = (Model, populateOpts) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    // Build query
    let query = Model.findById(id);
    if (populateOpts) query = query.populate(populateOpts);

    // Execute query
    const document = await query;

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }

    if (document.constructor.modelName === 'Product') {
      setImageUrl(document);
    }
    res.status(200).json({ data: document });
  });

exports.getAll = (Model, modelName = '') =>
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObject) {
      filter = req.filterObject;
    }

    // Build query
    // const documentsCounts = await Model.countDocuments();
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .search(modelName)
      .limitFields()
      .sort();
    // .paginate();

    // Apply pagination after filer and search
    const docsCount = await Model.countDocuments(apiFeatures.mongooseQuery);
    apiFeatures.paginate(docsCount);

    // Execute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    // Set Images url
    if (Model.collection.collectionName === 'products') {
      documents.forEach((doc) => setImageUrl(doc));
    }
    res
      .status(200)
      .json({ results: docsCount, paginationResult, data: documents });
  });

exports.deleteAll = (Model) =>
  asyncHandler(async (req, res, next) => {
    await Model.deleteMany();
    // 204 no content
    res.status(204).send();
  });
