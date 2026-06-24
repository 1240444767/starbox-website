import { ApplicationConfig, mergeApplicationConfig } from "@angular/core";
import { provideServerRendering } from "@angular/platform-server";

import { appConfig } from "./app.config";

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering()],
};

const config = mergeApplicationConfig(appConfig, serverConfig);
export default config;
