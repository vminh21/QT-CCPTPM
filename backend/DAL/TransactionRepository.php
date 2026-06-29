<?php
require_once __DIR__ . '/../Config/Database.php';

class TransactionRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function beginTransaction() {
        return $this->db->beginTransaction();
    }

    public function commit() {
        return $this->db->commit();
    }

    public function rollBack() {
        return $this->db->rollBack();
    }

    public function createTransaction($member_id, $amount, $method, $type) {
        $stmt = $this->db->prepare("INSERT INTO transactions (member_id, amount, payment_method, transaction_type, transaction_date) VALUES (:member_id, :amount, :method, :type, NOW())");
        $stmt->bindParam(':member_id', $member_id);
        $stmt->bindParam(':amount', $amount);
        $stmt->bindParam(':method', $method);
        $stmt->bindParam(':type', $type);
        $stmt->execute();
        return $this->db->lastInsertId();
    }

    public function createTransactionWithNote($member_id, $amount, $method, $type, $note) {
        $stmt = $this->db->prepare("INSERT INTO transactions (member_id, amount, payment_method, transaction_type, note, transaction_date) VALUES (:member_id, :amount, :method, :type, :note, NOW())");
        $stmt->bindParam(':member_id', $member_id);
        $stmt->bindParam(':amount', $amount);
        $stmt->bindParam(':method', $method);
        $stmt->bindParam(':type', $type);
        $stmt->bindParam(':note', $note);
        $stmt->execute();
        return $this->db->lastInsertId();
    }

    public function updateTransaction($transaction_id, $amount, $method, $type) {
        $stmt = $this->db->prepare("UPDATE transactions SET amount=:amount, payment_method=:method, transaction_type=:type WHERE transaction_id=:id");
        $stmt->bindParam(':amount', $amount);
        $stmt->bindParam(':method', $method);
        $stmt->bindParam(':type', $type);
        $stmt->bindParam(':id', $transaction_id);
        return $stmt->execute();
    }

    public function getTransactionById($transaction_id) {
        $stmt = $this->db->prepare("SELECT * FROM transactions WHERE transaction_id = :id");
        $stmt->bindParam(':id', $transaction_id);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function deleteTransaction($transaction_id) {
        $stmt = $this->db->prepare("DELETE FROM transactions WHERE transaction_id = :id");
        $stmt->bindParam(':id', $transaction_id);
        return $stmt->execute();
    }

    public function getMemberTransactionsAsc($member_id) {
        $stmt = $this->db->prepare("SELECT amount, transaction_date FROM transactions WHERE member_id = :id ORDER BY transaction_date ASC");
        $stmt->bindParam(':id', $member_id);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function checkMultipleRegistrations($member_id, $exclude_transaction_id) {
        $stmt = $this->db->prepare("SELECT transaction_id FROM transactions WHERE member_id = :m_id AND transaction_type = 'Registration' AND transaction_id != :t_id");
        $stmt->bindParam(':m_id', $member_id);
        $stmt->bindParam(':t_id', $exclude_transaction_id);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }

    public function getTransactionsByMemberDesc($member_id) {
        $stmt = $this->db->prepare("SELECT * FROM transactions WHERE member_id = :id ORDER BY transaction_date DESC");
        $stmt->bindParam(':id', $member_id);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
?>
