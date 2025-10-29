<?php
$dbDir = __DIR__ . '/data';
if (!is_dir($dbDir)) mkdir($dbDir, 0755, true);
$dbFile = $dbDir . '/contacts.db';

try {
  $pdo = new PDO('sqlite:' . $dbFile);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $pdo->exec("CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      phone TEXT,
      service TEXT,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )");
} catch (Exception $e) { die('DB error: '.$e->getMessage()); }

if (isset($_GET['delete'])) {
  $id = (int)$_GET['delete'];
  $pdo->prepare("DELETE FROM contacts WHERE id=?")->execute([$id]);
  header('Location: submit.php?msg=deleted'); exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $name = trim($_POST['name'] ?? '');
  $email = trim($_POST['email'] ?? '');
  $phone = trim($_POST['phone'] ?? '');
  $service = trim($_POST['service'] ?? '');
  $message = trim($_POST['message'] ?? '');
  $errors = [];
  if (strlen($name) < 2) $errors[] = 'Nombre muy corto';
  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Email inválido';
  if (strlen($message) < 10) $errors[] = 'Mensaje muy corto';

  if ($errors) {
    header('Location: index.html?ok=0&err='.urlencode(implode(' | ', $errors)));
    exit;
  }
  $pdo->prepare("INSERT INTO contacts (name,email,phone,service,message) VALUES (?,?,?,?,?)")
      ->execute([$name,$email,$phone,$service,$message]);
  header('Location: index.html?ok=1'); exit;
}

$rows = $pdo->query("SELECT * FROM contacts ORDER BY created_at DESC LIMIT 10")->fetchAll(PDO::FETCH_ASSOC);
?>
<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Contactos</title></head>
<body style="background:#0b0c10;color:#fff;font-family:Arial;padding:20px;">
<h1>Contactos Recibidos</h1>
<?php if(isset($_GET['msg'])) echo '<p style="color:lime;">Registro eliminado</p>'; ?>
<table border="1" cellpadding="5" cellspacing="0" style="border-collapse:collapse;width:100%;color:#ddd;">
<tr><th>ID</th><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Servicio</th><th>Mensaje</th><th>Fecha</th><th>Acción</th></tr>
<?php foreach($rows as $r): ?>
<tr>
  <td><?= $r['id'] ?></td>
  <td><?= htmlspecialchars($r['name']) ?></td>
  <td><?= htmlspecialchars($r['email']) ?></td>
  <td><?= htmlspecialchars($r['phone']) ?></td>
  <td><?= htmlspecialchars($r['service']) ?></td>
  <td><?= nl2br(htmlspecialchars($r['message'])) ?></td>
  <td><?= $r['created_at'] ?></td>
  <td><a href="?delete=<?= $r['id'] ?>" style="color:red;" onclick="return confirm('¿Eliminar?')">Eliminar</a></td>
</tr>
<?php endforeach; ?>
</table>
</body></html>
