/**
 * Load icons.
 */

// Icons from Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faAngleDown,
  faBars,
  faFile,
  faCodePullRequest,
  faCodeMerge,
  faCircleXmark,
  faCircleCheck,
  faCircleMinus,
  faCodeCommit,
  faDownload,
  faBook,
} from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

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

export {}; // This module doesn't export anything; side-effects only
