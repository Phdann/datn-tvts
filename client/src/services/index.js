
export { default as api } from './api';

import * as authServiceModule from './authService';
export const authService = authServiceModule;

import * as majorServiceModule from './majorService';
export const majorService = majorServiceModule;

import * as facultyServiceModule from './facultyService';
export const facultyService = facultyServiceModule;

import * as userServiceModule from './userService';
export const userService = userServiceModule;

import * as roleServiceModule from './roleService';
export const roleService = roleServiceModule;

import * as chatServiceModule from './chatService';
export const chatService = chatServiceModule;

import * as bannerServiceModule from './bannerService';
export const bannerService = bannerServiceModule;

import * as statisticsServiceModule from './statisticsService';
export const statisticsService = statisticsServiceModule;

import * as subjectGroupServiceModule from './subjectGroupService';
export const subjectGroupService = subjectGroupServiceModule;

import * as admissionMethodServiceModule from './admissionMethodService';
export const admissionMethodService = admissionMethodServiceModule;

import * as historicalScoreServiceModule from './historicalScoreService';
export const historicalScoreService = historicalScoreServiceModule;

import * as postServiceModule from './postService';
export const postService = postServiceModule;

import * as categoryServiceModule from './categoryService';
export const categoryService = categoryServiceModule;

import * as majorSubjectMappingServiceModule from './majorSubjectMappingService';
export const majorSubjectMappingService = majorSubjectMappingServiceModule;

import * as scholarshipServiceModule from './scholarshipService';
export const scholarshipService = scholarshipServiceModule;

import * as searchServiceModule from './searchService';
export const searchService = searchServiceModule;

import * as settingsServiceModule from './settingsService';
export const settingsService = settingsServiceModule;

import * as trainingTypeServiceModule from './trainingTypeService';
export const trainingTypeService = trainingTypeServiceModule;

export default {
    authService: authServiceModule,
    majorService: majorServiceModule,
    facultyService: facultyServiceModule,
    userService: userServiceModule,
    roleService: roleServiceModule,
    chatService: chatServiceModule,
    bannerService: bannerServiceModule,
    statisticsService: statisticsServiceModule,
    subjectGroupService: subjectGroupServiceModule,
    admissionMethodService: admissionMethodServiceModule,
    historicalScoreService: historicalScoreServiceModule,
    postService: postServiceModule,
    categoryService: categoryServiceModule,
    majorSubjectMappingService: majorSubjectMappingServiceModule,
    searchService: searchServiceModule,
    settingsService: settingsServiceModule,
    scholarshipService: scholarshipServiceModule,
    trainingTypeService: trainingTypeServiceModule,
};
