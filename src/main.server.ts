import "@angular/platform-server/init";
import { render } from "@analogjs/router/server";

import { App } from "./app/app";
import appConfig from "./app/app.config.server";

export default render(App, appConfig);
