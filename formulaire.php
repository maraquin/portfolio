<?php
declare(strict_types=1);

// ====== CONFIGURATION ======
$destinataire = "maximeraquin7@gmail.com";   // l'adresse qui reçoit les messages
$expediteur   = "no-reply@maximerqn.alwaysdata.net";  // une adresse de VOTRE domaine (évite le spam)
$pageRetour   = "/index.html";                // page du portfolio vers laquelle revenir
// ===========================

// Accepter uniquement les envois via POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: $pageRetour");
    exit;
}

// Nettoyage : supprime les balises et les retours à la ligne (anti-injection d'en-têtes)
function nettoyer(string $valeur): string
{
    $valeur = strip_tags(trim($valeur));
    return str_replace(["\r", "\n"], ' ', $valeur);
}

$nom    = nettoyer($_POST['user_name'] ?? '');
$prenom = nettoyer($_POST['user_firstname'] ?? '');
$email  = filter_var(trim($_POST['user_mail'] ?? ''), FILTER_VALIDATE_EMAIL);
$message = trim(strip_tags($_POST['user_message'] ?? ''));

// Vérification des champs
if ($nom === '' || $prenom === '' || $email === false || $message === '') {
    header("Location: $pageRetour?envoi=erreur#contact");
    exit;
}

// Construction du mail
$sujet = "Nouveau message de $prenom $nom depuis votre portfolio";
$sujetEncode = '=?UTF-8?B?' . base64_encode($sujet) . '?=';

$corps  = "Vous avez reçu un nouveau message depuis votre portfolio.\n\n";
$corps .= "Nom : $nom\n";
$corps .= "Prénom : $prenom\n";
$corps .= "E-mail : $email\n\n";
$corps .= "Message :\n$message\n";

$entetes = [
    'From'         => $expediteur,
    'Reply-To'     => $email,   // vous pouvez répondre directement à la personne
    'MIME-Version' => '1.0',
    'Content-Type' => 'text/plain; charset=UTF-8',
    'X-Mailer'     => 'PHP/' . phpversion(),
];

// Envoi
$envoye = mail($destinataire, $sujetEncode, $corps, $entetes);

header("Location: $pageRetour?envoi=" . ($envoye ? 'ok' : 'erreur') . "#contact");
exit;

<?php if (($_GET['envoi'] ?? '') === 'ok'): ?>
    <p>Merci, votre message a bien été envoyé !</p>
<?php elseif (($_GET['envoi'] ?? '') === 'erreur'): ?>
    <p>Une erreur est survenue, merci de réessayer.</p>
<?php endif; ?>