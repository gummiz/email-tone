import { OAuth2Client } from 'google-auth-library';

// Create a wrapper class that includes the gaxios property
export class OAuth2ClientWithGaxios extends OAuth2Client {
  gaxios: any;

  constructor(options: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  }) {
    super(options);
    // Mock gaxios instance with required methods
    this.gaxios = {
      request: async (config: any) => {
        return super.request(config);
      },
    };
  }
}
