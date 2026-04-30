<?php

class SMTPMailer {
    private $host;
    private $port;
    private $username;
    private $password;
    private $socket;
    
    public function __construct($host, $port, $username, $password) {
        $this->host = $host;
        $this->port = $port;
        $this->username = $username;
        $this->password = $password;
    }
    
    private function serverParse($socket, $response, $line = __LINE__) {
        $server_response = '';
        while (substr($server_response, 3, 1) != ' ') {
            if (!($server_response = fgets($socket, 256))) {
                throw new Exception("Error reading from SMTP server");
            }
        }
        if (!(substr($server_response, 0, 3) == $response)) {
            throw new Exception("SMTP Error: $server_response");
        }
    }
    
    public function send($to, $subject, $message, $from = null, $fromName = null) {
        if (!$from) $from = $this->username;
        
        // Connect to the server
        $this->socket = fsockopen(($this->port == 465 ? 'ssl://' : '') . $this->host, $this->port, $errno, $errstr, 15);
        
        if (!$this->socket) {
            throw new Exception("Could not connect to SMTP server: $errstr ($errno)");
        }
        
        $this->serverParse($this->socket, "220");
        
        fwrite($this->socket, "EHLO " . $this->host . "\r\n");
        $this->serverParse($this->socket, "250");
        
        fwrite($this->socket, "AUTH LOGIN\r\n");
        $this->serverParse($this->socket, "334");
        
        fwrite($this->socket, base64_encode($this->username) . "\r\n");
        $this->serverParse($this->socket, "334");
        
        fwrite($this->socket, base64_encode($this->password) . "\r\n");
        $this->serverParse($this->socket, "235");
        
        fwrite($this->socket, "MAIL FROM: <$from>\r\n");
        $this->serverParse($this->socket, "250");
        
        fwrite($this->socket, "RCPT TO: <$to>\r\n");
        $this->serverParse($this->socket, "250");
        
        fwrite($this->socket, "DATA\r\n");
        $this->serverParse($this->socket, "354");
        
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        if ($fromName) {
            $headers .= "From: $fromName <$from>\r\n";
        } else {
            $headers .= "From: $from\r\n";
        }
        $headers .= "To: <$to>\r\n";
        $headers .= "Subject: $subject\r\n";
        
        fwrite($this->socket, $headers . "\r\n" . $message . "\r\n.\r\n");
        $this->serverParse($this->socket, "250");
        
        fwrite($this->socket, "QUIT\r\n");
        fclose($this->socket);
        
        return true;
    }
}
