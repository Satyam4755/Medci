import cron from 'node-cron';
import ConsultationRequest from './models/ConsultationRequest.js';
import { cloudinary } from './config/cloudinary.js';

export const initCronJobs = () => {
  // Run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Running daily cleanup job for old requests...');
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Find requests older than 7 days
      const oldRequests = await ConsultationRequest.find({
        createdAt: { $lte: sevenDaysAgo }
      });

      console.log(`Found ${oldRequests.length} old requests to clean up.`);

      for (const req of oldRequests) {
        // Delete previous prescription from Cloudinary
        if (req.previousPrescription && req.previousPrescription.public_id) {
          try {
            await cloudinary.uploader.destroy(req.previousPrescription.public_id);
          } catch (err) {
            console.error(`Failed to delete cloudinary file ${req.previousPrescription.public_id}`, err);
          }
        }

        // Delete hair media from Cloudinary
        if (req.hairMedia && req.hairMedia.length > 0) {
          for (const media of req.hairMedia) {
            if (media.public_id) {
              try {
                await cloudinary.uploader.destroy(media.public_id, { resource_type: media.resource_type });
              } catch (err) {
                console.error(`Failed to delete cloudinary file ${media.public_id}`, err);
              }
            }
          }
        }

        // Delete the request document from MongoDB
        await ConsultationRequest.findByIdAndDelete(req._id);
      }
      
      console.log('Daily cleanup job completed successfully.');
    } catch (error) {
      console.error('Error in cron job cleanup:', error);
    }
  });
};
