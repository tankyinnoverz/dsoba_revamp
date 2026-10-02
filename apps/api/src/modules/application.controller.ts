import { Body, Controller, Get, Headers, Inject, Param, Post, UnauthorizedException } from '@nestjs/common'
import { ApplicationWorkflowService } from './application-workflow.js'
import { requireInternalAccess } from '../platform/internal-access.js'

@Controller('applications')
export class ApplicationController {
  constructor(@Inject(ApplicationWorkflowService) private readonly workflow: ApplicationWorkflowService) {}
  @Post('draft')
  createDraft(@Body() body: Record<string, unknown>) { return this.workflow.createDraft(body ?? {}) }
  @Post(':id/draft')
  saveDraft(@Param('id') id: string, @Headers('x-resume-token') resumeToken: string, @Body() body: Record<string, unknown>) { return this.workflow.saveDraft(id, resumeToken, body ?? {}) }
  @Post(':id/submit')
  submit(@Param('id') id: string, @Headers('x-resume-token') resumeToken: string, @Body() body: Record<string, unknown>) { return this.workflow.submit(id, resumeToken, body ?? {}) }
  @Get(':id')
  get(@Param('id') id: string, @Headers('x-resume-token') token: string) { return this.workflow.resume(id, token) }
}

@Controller('internal/applications')
export class InternalApplicationController {
  constructor(@Inject(ApplicationWorkflowService) private readonly workflow: ApplicationWorkflowService) {}
  @Get('pending')
  pending(@Headers('authorization') authorization?: string) { requireInternalAccess(authorization); return this.workflow.listPending() }
  @Post(':id/approve')
  approve(@Param('id') id: string, @Headers('authorization') authorization?: string) {
    return this.workflow.approve(id, requireInternalAccess(authorization))
  }
  @Post(':id/review')
  review(@Param('id') id: string, @Headers('authorization') authorization: string, @Body() body: { decision?: string; reason?: string }) {
    return this.workflow.review(id, requireInternalAccess(authorization), String(body?.decision ?? ''), String(body?.reason ?? ''))
  }
}

@Controller('members')
export class MemberController {
  constructor(@Inject(ApplicationWorkflowService) private readonly workflow: ApplicationWorkflowService) {}
  @Get(':id')
  get(@Param('id') id: string, @Headers('authorization') authorization?: string) { requireInternalAccess(authorization); return this.workflow.getMember(id) }
}
