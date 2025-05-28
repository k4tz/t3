/**
 * @description: This file is used to export all the utility functions. This will be imported in main file so that all utils become globally available
 * under the utils object. When adding any new util, make sure to add it to this file so that it becomes globally available too.
 */

import * as errors from "./error.js";
import * as auth from "./auth.js";

export { errors, auth };