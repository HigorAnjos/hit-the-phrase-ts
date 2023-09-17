import { type SaveFacebookAccountRepository, type LoadUserAccountRepository } from '@/data/Contracts/repos'
import { PgUser } from '@/infra/postgres/entities'
import { getRepository } from 'typeorm'

type loadParams = LoadUserAccountRepository.Params
type loadResult = LoadUserAccountRepository.Result
type saveParams = SaveFacebookAccountRepository.Params
type saveResult = SaveFacebookAccountRepository.Result

export class PgUserAccountRepository implements LoadUserAccountRepository, SaveFacebookAccountRepository {
  private readonly pgUserRepo = getRepository(PgUser)
  async load (params: loadParams): Promise<loadResult> {
    const pgUser = await this.pgUserRepo.findOne({ email: params.email })
    if (pgUser !== undefined) {
      return {
        id: pgUser?.id?.toString(),
        name: pgUser.name ?? undefined
      }
    }
  }

  async saveWithFacebook (params: saveParams): Promise<saveResult> {
    let id: string
    if (params.id === undefined) {
      const pgUser = await this.pgUserRepo.save({
        email: params.email,
        name: params.name,
        facebookId: params.facebookId
      })
      id = pgUser.id.toString()
    } else {
      id = params.id
      await this.pgUserRepo.update({
        id: parseInt(params.id)
      }, {
        name: params.name,
        facebookId: params.facebookId
      })
    }
    return { id }
  }
}
