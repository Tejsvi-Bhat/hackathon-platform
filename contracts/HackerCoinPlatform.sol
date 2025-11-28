// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title HackerCoinPlatform
 * @dev Smart contract for hackathon platform with HackerCoin economy
 * 
 * Economics:
 * - 1 HackerCoin (HC) = 0.000001 ETH = 1,000,000 wei
 * - Create Hackathon: Prize Pool + (1 HC × number of judges)
 * - Submit Project: 1 HC (20% to organizer, 80% to judges)
 * - Registration: FREE
 */
contract HackerCoinPlatform {
    // ========== CONSTANTS ==========
    
    uint256 public constant HACKERCOIN = 1_000_000 wei; // 1 HC = 0.000001 ETH
    uint256 public constant HACKATHON_CREATION_FEE = 0; // No base fee
    uint256 public constant JUDGE_BASE_FEE = 1 * HACKERCOIN;
    uint256 public constant SUBMISSION_FEE = 1 * HACKERCOIN;
    uint256 public constant ORGANIZER_SHARE_PERCENT = 20;
    uint256 public constant JUDGE_SHARE_PERCENT = 80;
    
    // ========== STRUCTURES ==========
    
    struct Prize {
        string title;
        uint256 amount; // in HackerCoins
        uint256 position;
    }
    
    struct Hackathon {
        uint256 id;
        string name;
        string description;
        address organizer;
        uint256 prizePoolWei; // total prize pool in wei
        uint256 creationTimestamp;
        uint256 registrationDeadline;
        uint256 startDate;
        uint256 endDate;
        address[] judges;
        Prize[] prizes;
        uint256 judgePoolBalance; // accumulated from submissions
        uint256 organizerBalance; // accumulated from submissions
        bool active;
        uint256 projectCount;
    }
    
    struct Project {
        uint256 id;
        uint256 hackathonId;
        string name;
        string description;
        string githubUrl;
        string demoUrl;
        address participant;
        uint256 submissionTimestamp;
    }
    
    // ========== STATE VARIABLES ==========
    
    mapping(uint256 => Hackathon) public hackathons;
    uint256 public hackathonCount;
    
    mapping(uint256 => mapping(uint256 => Project)) public projects; // hackathonId => projectId => Project
    mapping(uint256 => mapping(address => bool)) public isJudge; // hackathonId => address => bool
    
    uint256 public platformBalance; // Platform fees collected
    address public platformOwner;
    
    // ========== EVENTS ==========
    
    event HackathonCreated(
        uint256 indexed hackathonId,
        address indexed organizer,
        string name,
        uint256 prizePoolWei,
        uint256 creationFeeWei,
        uint256 judgeCount
    );
    
    event JudgeAdded(
        uint256 indexed hackathonId,
        address indexed judge,
        uint256 baseFeeWei
    );
    
    event ProjectSubmitted(
        uint256 indexed hackathonId,
        uint256 indexed projectId,
        address indexed participant,
        string projectName,
        uint256 submissionFeeWei
    );
    
    event PrizesDistributed(
        uint256 indexed hackathonId,
        address[] winners,
        uint256[] amounts
    );
    
    event JudgesPaid(
        uint256 indexed hackathonId,
        uint256 totalAmount,
        uint256 judgeCount
    );
    
    event OrganizerPaid(
        uint256 indexed hackathonId,
        address indexed organizer,
        uint256 amount
    );
    
    // ========== CONSTRUCTOR ==========
    
    constructor() {
        platformOwner = msg.sender;
    }
    
    // ========== MODIFIERS ==========
    
    modifier onlyOrganizer(uint256 hackathonId) {
        require(hackathons[hackathonId].organizer == msg.sender, "Not organizer");
        _;
    }
    
    modifier hackathonExists(uint256 hackathonId) {
        require(hackathonId > 0 && hackathonId <= hackathonCount, "Hackathon does not exist");
        _;
    }
    
    modifier hackathonActive(uint256 hackathonId) {
        require(hackathons[hackathonId].active, "Hackathon not active");
        _;
    }
    
    // ========== MAIN FUNCTIONS ==========
    
    /**
     * @notice Create a new hackathon
     * @param name Hackathon name
     * @param description Hackathon description
     * @param judgeAddresses Array of judge wallet addresses
     * @param prizes Array of prize structures
     * @param registrationDeadline Unix timestamp for registration deadline
     * @param startDate Unix timestamp for hackathon start
     * @param endDate Unix timestamp for hackathon end
     */
    function createHackathon(
        string memory name,
        string memory description,
        address[] memory judgeAddresses,
        Prize[] memory prizes,
        uint256 registrationDeadline,
        uint256 startDate,
        uint256 endDate
    ) external payable {
        require(bytes(name).length > 0, "Name required");
        require(judgeAddresses.length > 0, "At least one judge required");
        
        // Calculate total prize pool in wei
        uint256 totalPrizePoolWei = 0;
        for (uint i = 0; i < prizes.length; i++) {
            totalPrizePoolWei += prizes[i].amount * HACKERCOIN;
        }
        
        // Calculate required payment
        uint256 judgesFeeWei = judgeAddresses.length * JUDGE_BASE_FEE;
        uint256 requiredAmountWei = HACKATHON_CREATION_FEE + totalPrizePoolWei + judgesFeeWei;
        
        require(msg.value >= requiredAmountWei, "Insufficient payment");
        
        // Create hackathon
        hackathonCount++;
        Hackathon storage h = hackathons[hackathonCount];
        h.id = hackathonCount;
        h.name = name;
        h.description = description;
        h.organizer = msg.sender;
        h.prizePoolWei = totalPrizePoolWei;
        h.creationTimestamp = block.timestamp;
        h.registrationDeadline = registrationDeadline;
        h.startDate = startDate;
        h.endDate = endDate;
        h.active = true;
        h.judgePoolBalance = 0;
        h.organizerBalance = 0;
        h.projectCount = 0;
        
        // Store prizes
        for (uint i = 0; i < prizes.length; i++) {
            h.prizes.push(prizes[i]);
        }
        
        // Add judges and pay base fee immediately
        for (uint i = 0; i < judgeAddresses.length; i++) {
            address judge = judgeAddresses[i];
            require(judge != address(0), "Invalid judge address");
            require(!isJudge[hackathonCount][judge], "Duplicate judge");
            
            h.judges.push(judge);
            isJudge[hackathonCount][judge] = true;
            
            // Pay judge base fee
            payable(judge).transfer(JUDGE_BASE_FEE);
            
            emit JudgeAdded(hackathonCount, judge, JUDGE_BASE_FEE);
        }
        
        // Platform keeps creation fee
        platformBalance += HACKATHON_CREATION_FEE;
        
        emit HackathonCreated(
            hackathonCount,
            msg.sender,
            name,
            totalPrizePoolWei,
            HACKATHON_CREATION_FEE,
            judgeAddresses.length
        );
    }
    
    /**
     * @notice Add a judge to an existing hackathon (organizer only)
     * @param hackathonId The hackathon ID
     * @param judgeAddress The judge's wallet address
     */
    function addJudge(
        uint256 hackathonId,
        address judgeAddress
    ) external payable hackathonExists(hackathonId) hackathonActive(hackathonId) onlyOrganizer(hackathonId) {
        require(judgeAddress != address(0), "Invalid judge address");
        require(!isJudge[hackathonId][judgeAddress], "Already a judge");
        require(msg.value >= JUDGE_BASE_FEE, "Insufficient payment for judge fee");
        
        Hackathon storage h = hackathons[hackathonId];
        
        // Add judge
        h.judges.push(judgeAddress);
        isJudge[hackathonId][judgeAddress] = true;
        
        // Pay judge base fee immediately
        payable(judgeAddress).transfer(JUDGE_BASE_FEE);
        
        emit JudgeAdded(hackathonId, judgeAddress, JUDGE_BASE_FEE);
    }
    
    /**
     * @notice Submit a project to a hackathon
     * @param hackathonId The hackathon ID
     * @param projectName Project name
     * @param projectDescription Project description
     * @param githubUrl GitHub repository URL
     * @param demoUrl Demo/deployment URL
     */
    function submitProject(
        uint256 hackathonId,
        string memory projectName,
        string memory projectDescription,
        string memory githubUrl,
        string memory demoUrl
    ) external payable hackathonExists(hackathonId) hackathonActive(hackathonId) {
        require(msg.value >= SUBMISSION_FEE, "Insufficient submission fee");
        require(bytes(projectName).length > 0, "Project name required");
        
        Hackathon storage h = hackathons[hackathonId];
        
        // Create project
        h.projectCount++;
        Project storage p = projects[hackathonId][h.projectCount];
        p.id = h.projectCount;
        p.hackathonId = hackathonId;
        p.name = projectName;
        p.description = projectDescription;
        p.githubUrl = githubUrl;
        p.demoUrl = demoUrl;
        p.participant = msg.sender;
        p.submissionTimestamp = block.timestamp;
        
        // Distribute submission fee
        uint256 organizerAmountWei = (SUBMISSION_FEE * ORGANIZER_SHARE_PERCENT) / 100;
        uint256 judgeAmountWei = (SUBMISSION_FEE * JUDGE_SHARE_PERCENT) / 100;
        
        h.organizerBalance += organizerAmountWei;
        h.judgePoolBalance += judgeAmountWei;
        
        emit ProjectSubmitted(
            hackathonId,
            h.projectCount,
            msg.sender,
            projectName,
            SUBMISSION_FEE
        );
    }
    
    /**
     * @notice Distribute prizes to winners and pay judges/organizer
     * @param hackathonId The hackathon ID
     * @param winners Array of winner addresses (in order: 1st, 2nd, 3rd, etc.)
     * @param prizeAmountsHC Array of prize amounts in HackerCoins
     */
    function distributePrizes(
        uint256 hackathonId,
        address[] memory winners,
        uint256[] memory prizeAmountsHC
    ) external hackathonExists(hackathonId) hackathonActive(hackathonId) onlyOrganizer(hackathonId) {
        require(winners.length == prizeAmountsHC.length, "Array length mismatch");
        require(winners.length > 0, "At least one winner required");
        
        Hackathon storage h = hackathons[hackathonId];
        
        // Convert HackerCoins to wei and validate
        uint256[] memory prizeAmountsWei = new uint256[](prizeAmountsHC.length);
        uint256 totalPrizesWei = 0;
        
        for (uint i = 0; i < prizeAmountsHC.length; i++) {
            prizeAmountsWei[i] = prizeAmountsHC[i] * HACKERCOIN;
            totalPrizesWei += prizeAmountsWei[i];
        }
        
        require(totalPrizesWei <= h.prizePoolWei, "Prizes exceed prize pool");
        
        // Distribute prizes
        for (uint i = 0; i < winners.length; i++) {
            require(winners[i] != address(0), "Invalid winner address");
            payable(winners[i]).transfer(prizeAmountsWei[i]);
        }
        
        h.prizePoolWei -= totalPrizesWei;
        
        emit PrizesDistributed(hackathonId, winners, prizeAmountsWei);
        
        // Pay judges their share from submission fees
        if (h.judgePoolBalance > 0 && h.judges.length > 0) {
            uint256 judgePaymentWei = h.judgePoolBalance / h.judges.length;
            
            for (uint i = 0; i < h.judges.length; i++) {
                payable(h.judges[i]).transfer(judgePaymentWei);
            }
            
            emit JudgesPaid(hackathonId, h.judgePoolBalance, h.judges.length);
            h.judgePoolBalance = 0;
        }
        
        // Pay organizer their share from submission fees
        if (h.organizerBalance > 0) {
            uint256 organizerPayment = h.organizerBalance;
            h.organizerBalance = 0;
            payable(h.organizer).transfer(organizerPayment);
            
            emit OrganizerPaid(hackathonId, h.organizer, organizerPayment);
        }
        
        // Mark hackathon as inactive
        h.active = false;
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @notice Get hackathon details
     */
    function getHackathon(uint256 hackathonId)
        external
        view
        hackathonExists(hackathonId)
        returns (
            string memory name,
            string memory description,
            address organizer,
            uint256 prizePoolWei,
            uint256 projectCount,
            uint256 judgeCount,
            bool active,
            uint256 registrationDeadline,
            uint256 startDate,
            uint256 endDate
        )
    {
        Hackathon storage h = hackathons[hackathonId];
        return (
            h.name,
            h.description,
            h.organizer,
            h.prizePoolWei,
            h.projectCount,
            h.judges.length,
            h.active,
            h.registrationDeadline,
            h.startDate,
            h.endDate
        );
    }
    
    /**
     * @notice Get prizes for a hackathon
     */
    function getPrizes(uint256 hackathonId)
        external
        view
        hackathonExists(hackathonId)
        returns (Prize[] memory)
    {
        return hackathons[hackathonId].prizes;
    }
    
    /**
     * @notice Get project details
     */
    function getProject(uint256 hackathonId, uint256 projectId)
        external
        view
        returns (
            string memory name,
            string memory description,
            string memory githubUrl,
            string memory demoUrl,
            address participant,
            uint256 submissionTimestamp
        )
    {
        Project storage p = projects[hackathonId][projectId];
        require(bytes(p.name).length > 0, "Project does not exist");
        
        return (
            p.name,
            p.description,
            p.githubUrl,
            p.demoUrl,
            p.participant,
            p.submissionTimestamp
        );
    }
    
    /**
     * @notice Get all judges for a hackathon
     */
    function getJudges(uint256 hackathonId)
        external
        view
        hackathonExists(hackathonId)
        returns (address[] memory)
    {
        return hackathons[hackathonId].judges;
    }
    
    /**
     * @notice Check if address is a judge for hackathon
     */
    function isHackathonJudge(uint256 hackathonId, address addr)
        external
        view
        returns (bool)
    {
        return isJudge[hackathonId][addr];
    }
    
    /**
     * @notice Get all hackathon IDs where an address is a judge
     * @param judgeAddress The judge's address
     * @return hackathonIds Array of hackathon IDs where the address is a judge
     */
    function getHackathonsForJudge(address judgeAddress)
        external
        view
        returns (uint256[] memory hackathonIds)
    {
        // First, count how many hackathons this judge is assigned to
        uint256 count = 0;
        for (uint256 i = 1; i <= hackathonCount; i++) {
            if (isJudge[i][judgeAddress]) {
                count++;
            }
        }
        
        // Create array with exact size needed
        hackathonIds = new uint256[](count);
        uint256 index = 0;
        
        // Fill array with hackathon IDs where judge is assigned
        for (uint256 i = 1; i <= hackathonCount; i++) {
            if (isJudge[i][judgeAddress]) {
                hackathonIds[index] = i;
                index++;
            }
        }
        
        return hackathonIds;
    }
    
    /**
     * @notice Convert ETH to HackerCoins for display
     */
    function weiToHackerCoins(uint256 weiAmount) public pure returns (uint256) {
        return weiAmount / HACKERCOIN;
    }
    
    /**
     * @notice Convert HackerCoins to wei for transactions
     */
    function hackerCoinsToWei(uint256 hackerCoins) public pure returns (uint256) {
        return hackerCoins * HACKERCOIN;
    }
    
    // ========== PLATFORM ADMIN FUNCTIONS ==========
    
    /**
     * @notice Withdraw platform fees (only owner)
     */
    function withdrawPlatformFees() external {
        require(msg.sender == platformOwner, "Only platform owner");
        require(platformBalance > 0, "No fees to withdraw");
        
        uint256 amount = platformBalance;
        platformBalance = 0;
        payable(platformOwner).transfer(amount);
    }
    
    /**
     * @notice Get platform balance
     */
    function getPlatformBalance() external view returns (uint256) {
        return platformBalance;
    }
}
