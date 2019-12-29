import controller from '../controllers/roles'
import { verifyToken } from '../libs/common'
module.exports = server => {
    server.route('/roles')
        .get(verifyToken, (req, res) => controller.get(req, res, server.db.models.Roles))
        .post(verifyToken, (req, res) => controller.nuevo(req, res, server.db.models.Roles))
}
