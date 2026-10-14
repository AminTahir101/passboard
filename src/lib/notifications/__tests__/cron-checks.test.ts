import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../notify', () => ({
  notifyMany: vi.fn().mockResolvedValue(undefined),
}))

/** Build a fluent query chain whose terminal operation resolves to `result`. */
function makeChain(result: { data: unknown[] | null; error: { message: string } | null }) {
  const chain: Record<string, unknown> = {}
  const resolve = vi.fn().mockResolvedValue(result)
  chain.select = vi.fn().mockReturnValue(chain)
  chain.eq = vi.fn().mockReturnValue(chain)
  chain.or = vi.fn().mockResolvedValue(result)
  chain.gte = vi.fn().mockReturnValue(chain)
  chain.lte = vi.fn().mockResolvedValue(result)
  chain.lt = vi.fn().mockResolvedValue(result)
  chain.delete = vi.fn().mockReturnValue(chain)
  // Make the last eq call in a chain resolve
  chain.eq = vi.fn().mockImplementation(() => {
    // Always return chain so further chaining works;
    // the caller awaits the full expression so we need the chain itself to be thenable.
    // We handle termination by making the chain thenable.
    return chain
  })
  // Make chain thenable so `await chain` resolves to result
  chain.then = (onfulfilled: (v: unknown) => unknown) =>
    Promise.resolve(result).then(onfulfilled)
  chain.catch = (onrejected: (r: unknown) => unknown) =>
    Promise.resolve(result).catch(onrejected)
  chain.finally = (onfinally: () => void) =>
    Promise.resolve(result).finally(onfinally)
  return { chain, resolve }
}

vi.mock('@/lib/supabase/admin', () => {
  // We'll set up the admin mock lazily via a factory that tests can control
  return {
    createAdminClient: vi.fn(),
  }
})

import {
  checkExamCountdown,
  checkInactivity,
  runCleanup,
  checkAccessExpiring,
  checkStudyPlanReminder,
} from '../cron-checks'
import { notifyMany } from '../notify'
import { createAdminClient } from '@/lib/supabase/admin'

describe('checkExamCountdown()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls notifyMany with exam_countdown type when users have upcoming exams', async () => {
    const { chain } = makeChain({ data: [{ id: 'user-1' }], error: null })
    vi.mocked(createAdminClient).mockReturnValue({ from: vi.fn().mockReturnValue(chain) } as never)
    await checkExamCountdown()
    expect(notifyMany).toHaveBeenCalledWith(
      expect.arrayContaining(['user-1']),
      expect.objectContaining({ type: 'exam_countdown' })
    )
  })

  it('does not call notifyMany when no users match', async () => {
    const { chain } = makeChain({ data: [], error: null })
    vi.mocked(createAdminClient).mockReturnValue({ from: vi.fn().mockReturnValue(chain) } as never)
    await checkExamCountdown()
    expect(notifyMany).not.toHaveBeenCalled()
  })
})

describe('checkInactivity()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls notifyMany with inactivity type', async () => {
    const chain: Record<string, unknown> = {}
    chain.select = vi.fn().mockReturnValue(chain)
    chain.eq = vi.fn().mockReturnValue(chain)
    chain.or = vi.fn().mockResolvedValue({ data: [{ id: 'user-2' }], error: null })
    vi.mocked(createAdminClient).mockReturnValue({ from: vi.fn().mockReturnValue(chain) } as never)
    await checkInactivity()
    expect(notifyMany).toHaveBeenCalledWith(
      ['user-2'],
      expect.objectContaining({ type: 'inactivity' })
    )
  })

  it('does not call notifyMany when no users match', async () => {
    const chain: Record<string, unknown> = {}
    chain.select = vi.fn().mockReturnValue(chain)
    chain.eq = vi.fn().mockReturnValue(chain)
    chain.or = vi.fn().mockResolvedValue({ data: [], error: null })
    vi.mocked(createAdminClient).mockReturnValue({ from: vi.fn().mockReturnValue(chain) } as never)
    await checkInactivity()
    expect(notifyMany).not.toHaveBeenCalled()
  })
})

describe('checkAccessExpiring()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls notifyMany with access_expiring type when users match', async () => {
    const { chain } = makeChain({ data: [{ id: 'user-3' }], error: null })
    vi.mocked(createAdminClient).mockReturnValue({ from: vi.fn().mockReturnValue(chain) } as never)
    await checkAccessExpiring()
    expect(notifyMany).toHaveBeenCalledWith(
      ['user-3'],
      expect.objectContaining({ type: 'access_expiring' })
    )
  })

  it('does not call notifyMany when no users match', async () => {
    const { chain } = makeChain({ data: [], error: null })
    vi.mocked(createAdminClient).mockReturnValue({ from: vi.fn().mockReturnValue(chain) } as never)
    await checkAccessExpiring()
    expect(notifyMany).not.toHaveBeenCalled()
  })
})

describe('checkStudyPlanReminder()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls notifyMany with study_plan_reminder type when tasks exist today', async () => {
    const { chain } = makeChain({ data: [{ user_id: 'user-4' }], error: null })
    vi.mocked(createAdminClient).mockReturnValue({ from: vi.fn().mockReturnValue(chain) } as never)
    await checkStudyPlanReminder()
    expect(notifyMany).toHaveBeenCalledWith(
      ['user-4'],
      expect.objectContaining({ type: 'study_plan_reminder' })
    )
  })

  it('does not call notifyMany when no tasks match', async () => {
    const { chain } = makeChain({ data: [], error: null })
    vi.mocked(createAdminClient).mockReturnValue({ from: vi.fn().mockReturnValue(chain) } as never)
    await checkStudyPlanReminder()
    expect(notifyMany).not.toHaveBeenCalled()
  })
})

describe('runCleanup()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('resolves without throwing', async () => {
    const chain: Record<string, unknown> = {}
    chain.delete = vi.fn().mockReturnValue(chain)
    chain.lt = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(createAdminClient).mockReturnValue({ from: vi.fn().mockReturnValue(chain) } as never)
    await expect(runCleanup()).resolves.not.toThrow()
  })

  it('does not throw even if cleanup query errors', async () => {
    const chain: Record<string, unknown> = {}
    chain.delete = vi.fn().mockReturnValue(chain)
    chain.lt = vi.fn().mockResolvedValue({ error: { message: 'DB error' } })
    vi.mocked(createAdminClient).mockReturnValue({ from: vi.fn().mockReturnValue(chain) } as never)
    await expect(runCleanup()).resolves.not.toThrow()
  })
})
