import type { Plan, Workspace, WorkspaceSubscription } from '@prisma/client';

type WorkspaceWithSubscription = Workspace & {
  subscription: (WorkspaceSubscription & { plan: Plan }) | null;
};

export function serializePlan(plan: Plan) {
  return {
    ...plan,
    maxStorageBytes: plan.maxStorageBytes.toString(),
  };
}

export function serializeWorkspace(workspace: WorkspaceWithSubscription | null) {
  if (!workspace) return null;
  return {
    ...workspace,
    subscription: workspace.subscription
      ? {
          ...workspace.subscription,
          plan: serializePlan(workspace.subscription.plan),
        }
      : null,
  };
}
