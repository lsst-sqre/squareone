/**
 * Load icons.
 */

// Icons from Font Awesome
import { config, library } from '@fortawesome/fontawesome-svg-core';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import {
  faAngleDown,
  faBars,
  faBook,
  faCircleCheck,
  faCircleMinus,
  faCircleXmark,
  faCodeCommit,
  faCodeMerge,
  faCodePullRequest,
  faDownload,
  faFile,
} from '@fortawesome/free-solid-svg-icons';

// Prevent Font Awesome from adding its CSS since we import it manually
config.autoAddCss = false;

// Add icons to the global Font Awesome library
library.add(faAngleDown);
library.add(faBars);
library.add(faFile);
library.add(faCodePullRequest);
library.add(faCodeMerge);
library.add(faCircleXmark);
library.add(faCircleCheck);
library.add(faCircleMinus);
library.add(faCodeCommit);
library.add(faDownload);
library.add(faBook);
library.add(faGithub);
