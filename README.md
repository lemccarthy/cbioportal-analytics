### Analytics Node Server

This service is more or less a proxy to the Google Analytics API so that the metrics for cBioportal may be made public.

#### Setup

There is not much to configuring this server. It needs three environmental variable set: 
- `VIEW_ID`, which corresponds to the ID of the analytics View.
- `PORT`, the port the server should listen on.
- `CBIO_ORIGIN`, the origin URL that the cbioportal frontend is going to be making requests from. 

You need to create a service account, add the service account as a user on the analytics project, and then download the JSON keyfile from Google. Then, simply place the keyfile inside `/src` and rename it to `keyFile.json`

#### Install
Run: `npm install && npm run start` to deploy the server