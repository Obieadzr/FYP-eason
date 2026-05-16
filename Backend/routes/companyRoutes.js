import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { 
  inviteUser, 
  acceptInvite, 
  listMembers, 
  changeRole, 
  removeMember, 
  getApprovalQueue 
} from "../controllers/companyController.js";

const router = express.Router();

router.post("/invite", authMiddleware, inviteUser);
router.post("/accept-invite", acceptInvite); // Public route, relies on JWT token inside body
router.get("/members", authMiddleware, listMembers);
router.put("/role", authMiddleware, changeRole);
router.delete("/member/:userId", authMiddleware, removeMember);
router.get("/approvals", authMiddleware, getApprovalQueue);

export default router;
