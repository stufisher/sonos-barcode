import base64
import enum
from io import BytesIO
import os
import time
import uuid

import jinja2
import qrcode

try:
    import pdfkit
except ImportError:
    pdfkit = None


class PageTemplates(str, enum.Enum):
    single = "single"
    avery_a5 = "avery_a5"


def generate_code(data: str) -> str:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=2,
    )
    qr.add_data(data)
    qr.make(fit=True)

    buffer = BytesIO()
    image = qr.make_image(fill_color="black", back_color="white")
    image.save(buffer, format="JPEG")
    return base64.b64encode(buffer.getvalue())


def generate_page(
    label_prefix: str,
    *,
    rows: int = 8,
    per_row: int = 5,
    offset: int = 1,
    template: PageTemplates,
    label: bool = True,
    preview: bool = True,
) -> None:
    base_dir = os.path.dirname(__file__)
    env = jinja2.Environment(loader=jinja2.FileSystemLoader(base_dir))
    code_template = env.get_template("templates/code.html")
    code_html = ""
    width = round(1 / per_row * 100, 3)
    total = rows * per_row
    if template == PageTemplates.avery_a5:
        total *= 2

    for i in range(total):
        data = str(uuid.uuid4()).replace("-", "")
        qr_base64 = generate_code(data)
        code_html += code_template.render(
            qr_base64=qr_base64.decode("utf-8"),
            text=f"{label_prefix}-{i+1+offset}",
            label=label,
            width=width,
        )

    css = ""
    with open(f"{base_dir}/templates/style.css") as css_file:
        css = css_file.read()

    page_template = env.get_template("templates/page.html")
    layout_template = env.get_template(f"templates/{template}.html")
    layout_html = layout_template.render(code_html=code_html)
    page_args = {
        "css": css,
        "page": layout_html,
        "title": "Sonos Barcode &raquo; QR Codes",
    }

    page_html = page_template.render(**page_args)
    if preview:
        return page_html

    options = {
        "page-size": "A4",
        "margin-top": "0",
        "margin-right": "0",
        "margin-bottom": "0",
        "margin-left": "0",
        "disable-smart-shrinking": "",
    }
    return pdfkit.from_string(page_html, options=options)


if __name__ == "__main__":
    try:
        while True:
            prefix = "sb"
            generate_page(prefix, per_row=12, rows=14)
            time.sleep(2)
    except KeyboardInterrupt:
        exit()
