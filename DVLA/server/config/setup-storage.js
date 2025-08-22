const { database, STORAGE_BUCKETS } = require('./supabase');

/**
 * Setup Supabase Storage buckets for DVLA file uploads
 */
class StorageSetup {
  constructor() {
    this.client = database.client;
  }

  /**
   * Create storage buckets if they don't exist
   */
  async createBuckets() {
    const buckets = [
      {
        id: STORAGE_BUCKETS.DOCUMENTS,
        name: STORAGE_BUCKETS.DOCUMENTS,
        public: false,
        fileSizeLimit: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'image/webp',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
      },
      {
        id: STORAGE_BUCKETS.EVIDENCE,
        name: STORAGE_BUCKETS.EVIDENCE,
        public: false,
        fileSizeLimit: 20 * 1024 * 1024, // 20MB
        allowedMimeTypes: [
          'image/jpeg',
          'image/png',
          'image/webp',
          'video/mp4',
          'video/quicktime'
        ]
      },
      {
        id: STORAGE_BUCKETS.PAYMENT_PROOFS,
        name: STORAGE_BUCKETS.PAYMENT_PROOFS,
        public: false,
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'image/webp'
        ]
      }
    ];

    console.log('🔧 Setting up Supabase Storage buckets...');

    for (const bucket of buckets) {
      try {
        // Check if bucket exists
        const { data: existingBucket } = await this.client
          .storage
          .getBucket(bucket.id);

        if (existingBucket) {
          console.log(`✅ Bucket '${bucket.id}' already exists`);
          continue;
        }

        // Create bucket
        const { data, error } = await this.client
          .storage
          .createBucket(bucket.id, {
            public: bucket.public,
            fileSizeLimit: bucket.fileSizeLimit,
            allowedMimeTypes: bucket.allowedMimeTypes
          });

        if (error) {
          console.error(`❌ Failed to create bucket '${bucket.id}':`, error);
        } else {
          console.log(`✅ Created bucket '${bucket.id}'`);
        }
      } catch (error) {
        console.error(`❌ Error setting up bucket '${bucket.id}':`, error);
      }
    }
  }

  /**
   * Create storage policies for bucket access
   */
  async createStoragePolicies() {
    console.log('🔧 Setting up storage policies...');

    const policies = [
      {
        bucket: STORAGE_BUCKETS.DOCUMENTS,
        name: 'DVLA Documents Access',
        definition: 'true' // Allow all operations with service key
      },
      {
        bucket: STORAGE_BUCKETS.EVIDENCE,
        name: 'DVLA Evidence Access',
        definition: 'true'
      },
      {
        bucket: STORAGE_BUCKETS.PAYMENT_PROOFS,
        name: 'DVLA Payment Proofs Access',
        definition: 'true'
      }
    ];

    for (const policy of policies) {
      try {
        // Note: Storage policies are typically created via SQL in Supabase dashboard
        // This is a placeholder for policy creation logic
        console.log(`✅ Policy for bucket '${policy.bucket}' should be configured in Supabase dashboard`);
      } catch (error) {
        console.error(`❌ Error setting up policy for '${policy.bucket}':`, error);
      }
    }
  }

  /**
   * Test file upload and download operations
   */
  async testStorageOperations() {
    console.log('🧪 Testing storage operations...');

    const testFileName = `test-${Date.now()}.txt`;
    const testContent = 'This is a test file for DVLA storage setup';
    const testBuffer = Buffer.from(testContent, 'utf8');

    try {
      // Test upload
      const { data: uploadData, error: uploadError } = await this.client
        .storage
        .from(STORAGE_BUCKETS.DOCUMENTS)
        .upload(testFileName, testBuffer, {
          contentType: 'text/plain'
        });

      if (uploadError) {
        console.error('❌ Upload test failed:', uploadError);
        return false;
      }

      console.log('✅ Upload test successful');

      // Test download
      const { data: downloadData, error: downloadError } = await this.client
        .storage
        .from(STORAGE_BUCKETS.DOCUMENTS)
        .download(testFileName);

      if (downloadError) {
        console.error('❌ Download test failed:', downloadError);
        return false;
      }

      console.log('✅ Download test successful');

      // Clean up test file
      const { error: deleteError } = await this.client
        .storage
        .from(STORAGE_BUCKETS.DOCUMENTS)
        .remove([testFileName]);

      if (deleteError) {
        console.error('❌ Cleanup failed:', deleteError);
      } else {
        console.log('✅ Cleanup successful');
      }

      return true;
    } catch (error) {
      console.error('❌ Storage test failed:', error);
      return false;
    }
  }

  /**
   * Get signed URL for file access
   */
  async getSignedUrl(bucket, filePath, expiresIn = 3600) {
    try {
      const { data, error } = await this.client
        .storage
        .from(bucket)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        console.error('Error creating signed URL:', error);
        return null;
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }
  }

  /**
   * Upload file to storage
   */
  async uploadFile(bucket, fileName, fileBuffer, contentType) {
    try {
      const { data, error } = await this.client
        .storage
        .from(bucket)
        .upload(fileName, fileBuffer, {
          contentType,
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message };
      }

      // Get public URL
      const { data: publicData } = this.client
        .storage
        .from(bucket)
        .getPublicUrl(fileName);

      return {
        success: true,
        path: data.path,
        fullPath: data.fullPath,
        publicUrl: publicData.publicUrl
      };
    } catch (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(bucket, fileName) {
    try {
      const { error } = await this.client
        .storage
        .from(bucket)
        .remove([fileName]);

      if (error) {
        console.error('Delete error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Run complete storage setup
   */
  async setup() {
    console.log('🚀 Starting DVLA Supabase Storage setup...');

    try {
      await this.createBuckets();
      await this.createStoragePolicies();
      
      const testResult = await this.testStorageOperations();
      
      if (testResult) {
        console.log('✅ DVLA Supabase Storage setup completed successfully!');
      } else {
        console.log('⚠️ DVLA Supabase Storage setup completed with warnings');
      }

      return testResult;
    } catch (error) {
      console.error('❌ DVLA Supabase Storage setup failed:', error);
      return false;
    }
  }
}

// Create singleton instance
const storageSetup = new StorageSetup();

module.exports = {
  StorageSetup,
  storageSetup
};

// Run setup if this file is executed directly
if (require.main === module) {
  storageSetup.setup()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}
