<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");

// Obtener datos enviados desde el frontend
$data = json_decode(file_get_contents("php://input"));

if (empty($data->name) || empty($data->email) || empty($data->message)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Faltan datos requeridos."]);
    exit;
}

// Configuración
// ------------------------------------------------------------
$admin_email = "inffodox@gmail.com"; // Email que recibirá los mensajes
$site_name = "COMPUSTORE";
$domain = $_SERVER['HTTP_HOST'] ? $_SERVER['HTTP_HOST'] : 'compustore.com';
$sender_email = "noreply@" . $domain;
// ------------------------------------------------------------

$name = htmlspecialchars($data->name);
$email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
$phone = htmlspecialchars($data->phone ?? 'No proporcionado');
$message = htmlspecialchars($data->message);

// 1. Enviar correo al Administrador
$subject_admin = "Nuevo mensaje de contacto web: $name";
$body_admin = "Has recibido un nuevo contacto desde la web.\n\n";
$body_admin .= "Nombre: $name\n";
$body_admin .= "Email: $email\n";
$body_admin .= "Teléfono: $phone\n\n";
$body_admin .= "Mensaje:\n$message\n";

$headers_admin = "From: $site_name <$sender_email>\r\n";
$headers_admin .= "Reply-To: $email\r\n";
$headers_admin .= "Content-Type: text/plain; charset=UTF-8\r\n";

$sent_admin = mail($admin_email, $subject_admin, $body_admin, $headers_admin);

// 2. Enviar confirmación al Cliente (Opcional, pero recomendado)
$subject_client = "Hemos recibido tu mensaje - $site_name";
$body_client = "Hola $name,\n\n";
$body_client .= "Gracias por contactarnos. Hemos recibido tu mensaje correctamente y nos pondremos en contacto contigo a la brevedad.\n\n";
$body_client .= "Tu mensaje original:\n$message\n\n";
$body_client .= "Saludos,\nEl equipo de $site_name";

$headers_client = "From: $site_name <$sender_email>\r\n";
$headers_client .= "Content-Type: text/plain; charset=UTF-8\r\n";

mail($email, $subject_client, $body_client, $headers_client);

if ($sent_admin) {
    echo json_encode(["status" => "success", "message" => "Correo enviado correctamente."]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error al enviar el correo."]);
}
?>