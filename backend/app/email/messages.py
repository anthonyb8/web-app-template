from app.email.service import HtmlMessage


def load_email_template(template_path):
    with open(template_path, "r") as f:
        return f.read()


class ResetPasswordMessage(HtmlMessage):
    def __init__(self, reset_url: str) -> None:
        super().__init__()
        html_template = load_email_template(
            "app/email/templates/reset_password.html"
        )
        body = html_template.replace("{{RESET_URL}}", reset_url)
        self.msg = body


class VerifyEmailMessage(HtmlMessage):
    def __init__(self, verification_url: str) -> None:
        super().__init__()
        html_template = load_email_template(
            "app/email/templates/verify_email.html"
        )
        body = html_template.replace("{{VERIFICATION_URL}}", verification_url)
        self.msg = body
