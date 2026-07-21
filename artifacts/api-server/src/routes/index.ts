import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dashboardRouter from "./dashboard";
import researchRouter from "./research";
import contentRouter from "./content";
import videosRouter from "./videos";
import pipelineRouter from "./pipeline";
import youtubeRouter from "./youtube";
import automationRouter from "./automation";
import apiSettingsRouter from "./api_settings";
import draftScheduleRouter from "./drafts_schedules";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(researchRouter);
router.use(contentRouter);
router.use(videosRouter);
router.use(pipelineRouter);
router.use(youtubeRouter);
router.use(automationRouter);
router.use(apiSettingsRouter);
router.use(draftScheduleRouter);

export default router;
