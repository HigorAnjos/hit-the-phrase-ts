import { type Controller } from '@/application/controllers'
import { type RequestHandler, type Request, type Response, type NextFunction } from 'express'
import { getMockReq, getMockRes } from '@jest-mock/express'
import { type MockProxy, mock } from 'jest-mock-extended'
import { adaptExpressRoute } from '@/infra/http'

describe('ExpressRouter', () => {
  let req: Request
  let res: Response
  let controller: MockProxy<Controller>
  let sut: RequestHandler
  let next: NextFunction

  beforeEach(() => {
    req = getMockReq({ body: { any: 'any' } })
    res = getMockRes().res
    next = getMockRes().next
    controller = mock()
    controller.handle.mockResolvedValue({
      statusCode: 200,
      data: { data: 'any_data' }
    })
    sut = adaptExpressRoute(controller)
  })

  it('should call handle with correct request', async () => {
    // eslint-disable-next-line @typescript-eslint/await-thenable, @typescript-eslint/no-confusing-void-expression
    await sut(req, res, next)

    expect(controller.handle).toHaveBeenCalledWith({ any: 'any' })
    expect(controller.handle).toHaveBeenCalledTimes(1)
  })

  it('should call handle with empty request', async () => {
    const req = getMockReq({ body: undefined })
    // eslint-disable-next-line @typescript-eslint/await-thenable, @typescript-eslint/no-confusing-void-expression
    await sut(req, res, next)

    expect(controller.handle).toHaveBeenCalledWith({})
    expect(controller.handle).toHaveBeenCalledTimes(1)
  })

  it('should responde with 200 and valid data', async () => {
    // eslint-disable-next-line @typescript-eslint/await-thenable, @typescript-eslint/no-confusing-void-expression
    await sut(req, res, next)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ data: 'any_data' })
    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.json).toHaveBeenCalledTimes(1)
  })

  it('should responde with 400 and valid error', async () => {
    controller.handle.mockResolvedValueOnce({
      statusCode: 400,
      data: new Error('any_error')
    })
    // eslint-disable-next-line @typescript-eslint/await-thenable, @typescript-eslint/no-confusing-void-expression
    await sut(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.json).toHaveBeenCalledWith({ error: 'any_error' })
    expect(res.json).toHaveBeenCalledTimes(1)
  })

  it('should responde with 500 and valid error', async () => {
    controller.handle.mockResolvedValueOnce({
      statusCode: 500,
      data: new Error('any_error')
    })
    // eslint-disable-next-line @typescript-eslint/await-thenable, @typescript-eslint/no-confusing-void-expression
    await sut(req, res, next)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.json).toHaveBeenCalledWith({ error: 'any_error' })
    expect(res.json).toHaveBeenCalledTimes(1)
  })
})
