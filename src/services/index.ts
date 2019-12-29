import jwt from 'jwt-simple'
import moment from 'moment'
import { User } from '../models/User'

export default {
    createToken: (user: User) => {
        const payload = {
            sub: user.id,
            iat: moment().unix(),
            exp: moment().add(14, 'days').unix()
        }

        jwt.encode(payload, process.env.SECRET_TOKEN)
    }
}