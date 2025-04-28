import dotenv from "dotenv";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { CustomError } from "../middlewares/error";

dotenv.config();

// Cloudinary Configuration
try {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} catch (configError) {
  console.error("Cloudinary configuration error:", configError);
  throw new CustomError(500, "Cloudinary configuration failed");
}

// Create a dedicated folder in Cloudinary for ticket attachments
const TICKET_ATTACHMENTS_FOLDER = "ticket_attachments";

// ********** Ticket Attachments Functions **********
/**
 * Uploads multiple files to Cloudinary in the ticket attachments folder
 * @param files Array of files to upload
 * @returns Array of uploaded attachments
 */
export const uploadTicketAttachments = async (files: Express.Multer.File[]) => {
  try {
    const uploadPromises = files.map((file) => {
      return new Promise<UploadApiResponse>((resolve, reject) => {
        const isSvg = file.mimetype === "image/svg+xml";
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: TICKET_ATTACHMENTS_FOLDER,
            resource_type: isSvg ? "image" : "auto",
          },
          (error, result) => {
            if (error) {
              reject(
                new CustomError(
                  500,
                  `Failed to upload ${file.originalname}: ${error.message}`
                )
              );
            } else if (result) {
              resolve({ ...result });
            } else {
              reject(
                new CustomError(500, `Upload failed for ${file.originalname}`)
              );
            }
          }
        );

        uploadStream.end(file.buffer);
      });
    });

    const results = await Promise.allSettled(uploadPromises);

    const successfulUploads = results
      .filter((result) => result.status === "fulfilled")
      .map(
        (result) => (result as PromiseFulfilledResult<UploadApiResponse>).value
      );

    const failedUploads = results
      .filter((result) => result.status === "rejected")
      .map((result) => (result as PromiseRejectedResult).reason);

    if (failedUploads.length > 0) {
      console.error("Failed uploads:", failedUploads);
      throw new CustomError(
        400,
        `Failed to upload ${failedUploads.length} files`
      );
    }

    // Format the successful uploads into ticket attachments
    const attachments = successfulUploads.map((upload) => ({
      url: upload.secure_url,
      publicId: upload.public_id,
      fileName: upload.original_filename || "file",
      fileType: upload.resource_type,
      fileSize: upload.bytes,
      uploadedAt: new Date(upload.created_at),
    }));

    return attachments;
  } catch (error: any) {
    console.error("Error uploading ticket attachments:", error);
    throw new CustomError(
      error.statusCode || 500,
      error.message || "Failed to upload ticket attachments"
    );
  }
};

/**
 * Deletes ticket attachments from Cloudinary
 * @param publicIds Array of public IDs to delete
 */
export const deleteTicketAttachments = async (publicIds: string[]) => {
  try {
    if (!publicIds || publicIds.length === 0) return;

    // Cloudinary allows deleting multiple files at once
    const result = await cloudinary.api.delete_resources(publicIds);

    // Check for errors in deletion
    const failedDeletions = Object.entries(result.deleted)
      .filter(([_, value]) => value !== "deleted")
      .map(([publicId]) => publicId);

    if (failedDeletions.length > 0) {
      console.error("Failed to delete attachments:", failedDeletions);
      throw new CustomError(
        500,
        `Failed to delete ${failedDeletions.length} attachments`
      );
    }

    return result;
  } catch (error: any) {
    console.error("Error deleting ticket attachments:", error);
    throw new CustomError(
      error.statusCode || 500,
      error.message || "Failed to delete ticket attachments"
    );
  }
};

// ********** Existing Cloudinary Functions **********

// ********** Upload images to Cloudinary **********
export const uploadImages = async (files: Express.Multer.File[]) => {
  try {
    const uploadPromises = files.map((file) => {
      return new Promise<UploadApiResponse>((resolve, reject) => {
        const isSvg = file.mimetype === "image/svg+xml";
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: isSvg ? "image" : "auto",
          },
          (error, result) => {
            if (error) {
              reject({ error, file: file.originalname });
            } else if (result) {
              resolve({ ...result });
            } else {
              reject({
                error: new Error("Upload failed"),
                file: file.originalname,
              });
            }
          }
        );

        uploadStream.end(file.buffer);
      });
    });

    const results = await Promise.allSettled(uploadPromises);

    const successfulUploads = results
      .filter((result) => result.status === "fulfilled")
      .map(
        (result) => (result as PromiseFulfilledResult<UploadApiResponse>).value
      );

    const failedUploads = results
      .filter((result) => result.status === "rejected")
      .map((result) => (result as PromiseRejectedResult).reason);

    if (failedUploads.length > 0) {
      console.error("Failed uploads:", failedUploads);
    }

    // Function to fetch all images with retry logic
    async function fetchAllImagesWithRetry(
      maxRetries = 5,
      delayMs = 1000
    ): Promise<any[]> {
      // If no successful uploads, just fetch once
      if (successfulUploads.length === 0) {
        let allImages: any[] = [];
        let nextCursor: string | undefined = undefined;

        do {
          const response = await cloudinary.search
            .expression("resource_type:image")
            .max_results(500)
            .next_cursor(nextCursor)
            .sort_by("created_at", "desc")
            .execute()
            .catch((error) => {
              console.error("Error fetching images:", error);
              return { resources: [], next_cursor: undefined };
            });

          allImages = allImages.concat(response.resources);
          nextCursor = response.next_cursor;
        } while (nextCursor);

        return allImages;
      }

      // Retry logic for when there are new uploads
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        let allImages: any[] = [];
        let nextCursor: string | undefined = undefined;

        do {
          const response = await cloudinary.search
            .expression("resource_type:image")
            .max_results(500)
            .next_cursor(nextCursor)
            .sort_by("created_at", "desc")
            .execute()
            .catch((error) => {
              console.error(`Fetch attempt ${attempt} failed:`, error);
              return { resources: [], next_cursor: undefined };
            });

          allImages = allImages.concat(response.resources);
          nextCursor = response.next_cursor;
        } while (nextCursor);

        // Verify all successful uploads are present
        const allUploadsPresent = successfulUploads.every((upload) =>
          allImages.some((img) => img.public_id === upload.public_id)
        );

        if (allUploadsPresent) {
          return allImages;
        }

        console.log(
          `Attempt ${attempt}/${maxRetries}: Waiting for new uploads to index...`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      // If we reach here, retries failed - fetch one last time and return what we have
      console.warn("Max retries reached - returning available images");
      let allImages: any[] = [];
      let nextCursor: string | undefined = undefined;

      do {
        const response = await cloudinary.search
          .expression("resource_type:image")
          .max_results(500)
          .next_cursor(nextCursor)
          .sort_by("created_at", "desc")
          .execute();

        allImages = allImages.concat(response.resources);
        nextCursor = response.next_cursor;
      } while (nextCursor);

      return allImages;
    }

    const allImages = await fetchAllImagesWithRetry();

    return {
      successfulUploads,
      failedUploads,
      allImages,
    };
  } catch (error) {
    throw new CustomError(500, "Image upload failed: " + error);
  }
};

// *********** Fetch Image By Public ID **********
export const fetchImageByPublicId = async (public_id: string) => {
  try {
    const result = await cloudinary.search
      .expression(`public_id:${public_id}`)
      .execute();
    return result;
  } catch (error) {
    console.error("Error fetching image by public ID:", error);
    throw new CustomError(500, "Failed to fetch image by public ID");
  }
};

// ********** Fetch All images from Cloudinary with Pagination **********
export const fetchImagesInFolder = async (
  fileType: "svg" | "non-svg" | "all" = "all"
) => {
  try {
    let resources: any[] = [];
    let nextCursor: string | undefined = undefined;

    // Constructing the search expression based on the fileType parameter
    let expression = `folder:""`;
    if (fileType === "svg") {
      expression += ` AND resource_type:image AND format:svg`;
    } else if (fileType === "non-svg") {
      expression += ` AND resource_type:image AND NOT format:svg`;
    }

    do {
      const { resources: batch, next_cursor } = await cloudinary.search
        .expression(expression)
        .sort_by("created_at", "desc")
        .max_results(50)
        .with_field("context")
        .next_cursor(nextCursor)
        .execute();

      resources = resources.concat(batch);
      nextCursor = next_cursor;
    } while (nextCursor);

    return resources;
  } catch (error) {
    console.error("Error fetching images from Cloudinary:", error);
    throw new CustomError(500, "Failed to fetch images from Cloudinary");
  }
};

// ********** Delete image from Cloudinary **********
export const deleteImage = async (public_id: string) => {
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    if (result.result !== "ok") {
      throw new Error(`Failed to delete image with public ID: ${public_id}`);
    }
    return result;
  } catch (error) {
    throw new CustomError(500, `Failed to delete image: ${error}`);
  }
};

// ********** Edit image info from Cloudinary **********
export const editImageInfo = async (
  public_id: string,
  caption?: string,
  alt?: string
) => {
  try {
    const updateOptions: any = {};
    if (caption) {
      updateOptions.context = { caption: caption };
    }
    if (alt) {
      updateOptions.context = { ...updateOptions.context, alt: alt };
    }
    const result = await cloudinary.uploader.explicit(public_id, {
      type: "upload",
      ...updateOptions,
    });
    return result;
  } catch (error) {
    console.error("Error editing image info:", error);
    throw new CustomError(500, `Failed to edit image info: ${error}`);
  }
};

// ********** Get Cloudinary Storage Usage ***********
export const getCloudinaryStorageUsage = async () => {
  try {
    const response = await cloudinary.api.usage();
    return response;
  } catch (error) {
    throw new CustomError(
      500,
      `Failed to fetch Cloudinary storage usage info: ${error}`
    );
  }
};
