import qrcode
import io
import base64

def generateQrBase64(data):
    # Gera um QR code a partir dos dados fornecidos e retorna como uma string base64.
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    # Adiciona os dados ao QR code
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white") # Gera a imagem do QR code
    buffered = io.BytesIO() # Usa BytesIO para salvar a imagem em memória
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode('utf-8') # Converte a imagem para string base64
    
    return img_str