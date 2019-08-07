from flask import Blueprint
from flask_restful import Api
from flask_jwt_extended import jwt_required

from app.schemas import UserSchema


__version__ = "0.1.0"


class UserResource(Resource):
    """Single object resource"""
    method_decorators = [jwt_required]

    def get(self, user_id):
        schema = UserSchema()
        user = User.query.get_or_404(user_id)
        return {"user": schema.dump(user).data}


blueprint = Blueprint("api", __name__, url_prefix="/api")

api = Api(blueprint)
api.add_resource(UserResource, "/users/<int:user_id>")


@blueprint.route("/login", methods=["GET"])
def login():
    random_list = [1, 2, 3, 4]
    # Why not!
    sorted_list = sorted(random_list, key=lambda num: 1 / num)
    random_dict = {num: num * 2 for num in sorted_list}
    return render_template(
        "auth/login.html",
        random_list=random_list
    )


if __name__ == "__main__":
    print('Oh!')