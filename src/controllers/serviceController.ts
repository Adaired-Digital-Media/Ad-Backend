import Service from "../models/serviceModel";
import { NextFunction, Request, Response } from "express";
import { CustomError } from "../middlewares/error";
import slugify from "slugify";
import checkPermission from "../helpers/authHelper";
import { validationResult } from "express-validator";
import { fetchImageByPublicId } from "../utils/cloudinary";

// ********** Create Service **********

const createService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, body } = req;
    const { slug, canonicalLink, openGraphImage } = body;

    // Check Permission
    const permissionCheck = await checkPermission(userId, "services", 0);
    if (!permissionCheck) {
      return res.status(403).json({ message: "Permission denied" });
    }

    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid input",
        errors: errors.array(),
      });
    }

    // Check if Slug is already in use
    const existingService = await Service.findOne({
      slug: slugify(slug, { lower: true }),
    });
    if (existingService) {
      throw new CustomError(400, "Service with this slug already exists");
    }

    let ogImage;
    if (openGraphImage) {
      // find OG_Image
      ogImage = await fetchImageByPublicId(openGraphImage);
      if (!ogImage || !ogImage.resources || ogImage.resources.length === 0) {
        throw new CustomError(400, "Invalid openGraphImage");
      }
    }

    // Save service
    const serviceData = {
      ...body,
      canonicalLink:
        "https://adaired.com/services/" +
        slugify(canonicalLink, { lower: true }),
      openGraphImage: ogImage ? ogImage.resources[0].secure_url : undefined,
      slug: slugify(slug, { lower: true }),
    };
    const service = await Service.create(serviceData);

    // Update Parent Service if created service is a child service
    if (body.parentService) {
      await Service.findByIdAndUpdate(
        body.parentService,
        { $push: { childServices: { childServiceId: service._id } } },
        { new: true }
      );
    }

    res.status(201).json({
      message: "Service created successfully",
      data: service,
    });
  } catch (error) {
    next(error);
  }
};


// ********** Read Services **********

const readServices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { identifier } = req.params;

  try {
    let service;

    if (identifier) {
      // Check if the identifier is a valid MongoDB ObjectId
      if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
        service = await Service.findById(identifier).lean();
      } else {
        service = await Service.findOne({ slug: identifier }).lean();
      }

      if (!service) {
        return next(new CustomError(404, "Service not found!"));
      }

      return res.status(200).json(service);
    } else {
      // If no identifier is provided, return all services
      const services = await Service.find().lean();
      return res.status(200).json(services);
    }
  } catch (error) {
    return next(error);
  }
};

// ********** Update Service **********

const updateService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, body } = req;
    const { id } = req.params;

    // Check Permission
    const permissionCheck = await checkPermission(userId, "services", 2);
    if (!permissionCheck) {
      return res.status(403).json({ message: "Permission denied" });
    }

    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid input",
        errors: errors.array(),
      });
    }

    // Check if Slug is already in use
    if (body.slug) {
      const existingService = await Service.findOne({
        slug: slugify(body.slug, { lower: true }),
        _id: { $ne: id }, // Exclude the current service from the check
      });
      if (existingService) {
        throw new CustomError(400, "Service with this slug already exists");
      }
    }

    // Fetch and update OG_Image if provided
    let ogImageUrl;
    if (body.openGraphImage) {
      const ogImage = await fetchImageByPublicId(body.openGraphImage);
      if (!ogImage || !ogImage.resources || ogImage.resources.length === 0) {
        throw new CustomError(400, "Invalid openGraphImage");
      }
      ogImageUrl = ogImage.resources[0].secure_url;
    }

    // Prepare update data
    const updateData: any = {
      ...body,
      slug: body.slug ? slugify(body.slug, { lower: true }) : undefined,
      canonicalLink: body.canonicalLink
        ? "https://adaired.com/services/" +
          slugify(body.canonicalLink, { lower: true })
        : undefined,
      openGraphImage: ogImageUrl,
    };

    // Remove undefined fields from updateData
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    // Update service
    const updatedService = await Service.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedService) {
      return next(new CustomError(404, "Service not found!"));
    }

    res.status(200).json({
      message: "Service updated successfully",
      data: updatedService,
    });
  } catch (error) {
    next(error);
  }
};


// ********** Delete Service **********

const deleteService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req;
    const { id } = req.params;

    // Check Permission
    const permissionCheck = await checkPermission(userId, "services", 3);
    if (!permissionCheck) return;

    // Delete service
    const deletedService = await Service.findByIdAndDelete(id);

    // Remove service from parent's array
    if (deletedService.parentService) {
      const parentService = await Service.findByIdAndUpdate(
        deletedService.parentService,
        { $pull: { childServices: { childServiceId: id } } },
        { new: true }
      );
    }

    if (!deletedService) {
      return next(new CustomError(404, "Service not found!"));
    }

    res.status(200).json({
      message: "Service deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export { createService, readServices, updateService, deleteService };
