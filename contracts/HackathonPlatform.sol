// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HackathonPlatform {
    struct Hackathon {
        uint256 id;
        string name;
        string description;
        uint256 startDate;
        uint256 endDate;
        address organizer;
        bool isActive;
        uint256 createdAt;
    }

    struct Prize {
        uint256 id;
        uint256 hackathonId;
        string title;
        string description;
        uint256 amount;
        uint256 position;
    }

    struct Project {
        uint256 id;
        uint256 hackathonId;
        string name;
        string description;
        string githubUrl;
        string demoUrl;
        address[] teamMembers;
        uint256 submittedAt;
    }

    struct Score {
        uint256 projectId;
        address judge;
        uint256 technicalScore;
        uint256 innovationScore;
        uint256 presentationScore;
        uint256 impactScore;
        string feedback;
        uint256 scoredAt;
    }

    struct Schedule {
        uint256 id;
        uint256 hackathonId;
        string eventName;
        string description;
        uint256 eventTime;
    }

    mapping(uint256 => Hackathon) public hackathons;
    mapping(uint256 => Prize[]) public hackathonPrizes;
    mapping(uint256 => Project[]) public hackathonProjects;
    mapping(uint256 => mapping(uint256 => Score[])) public projectScores;
    mapping(uint256 => Schedule[]) public hackathonSchedules;
    mapping(uint256 => mapping(address => bool)) public hackathonJudges;
    mapping(uint256 => bool) public scoresReleased;

    uint256 public hackathonCount;
    uint256 public projectCount;
    uint256 public prizeCount;
    uint256 public scheduleCount;

    event HackathonCreated(uint256 indexed id, string name, address organizer);
    event PrizeAdded(uint256 indexed hackathonId, uint256 prizeId, string title);
    event ProjectSubmitted(uint256 indexed projectId, uint256 hackathonId, string name);
    event ProjectScored(uint256 indexed projectId, address judge);
    event ScoresReleased(uint256 indexed hackathonId);
    event ScheduleAdded(uint256 indexed hackathonId, uint256 scheduleId);
    event JudgeAdded(uint256 indexed hackathonId, address judge);

    modifier onlyOrganizer(uint256 hackathonId) {
        require(hackathons[hackathonId].organizer == msg.sender, "Not organizer");
        _;
    }

    modifier onlyJudge(uint256 hackathonId) {
        require(hackathonJudges[hackathonId][msg.sender], "Not a judge");
        _;
    }

    function createHackathon(
        string memory _name,
        string memory _description,
        uint256 _startDate,
        uint256 _endDate
    ) public returns (uint256) {
        hackathonCount++;
        hackathons[hackathonCount] = Hackathon({
            id: hackathonCount,
            name: _name,
            description: _description,
            startDate: _startDate,
            endDate: _endDate,
            organizer: msg.sender,
            isActive: true,
            createdAt: block.timestamp
        });

        emit HackathonCreated(hackathonCount, _name, msg.sender);
        return hackathonCount;
    }

    function addPrize(
        uint256 _hackathonId,
        string memory _title,
        string memory _description,
        uint256 _amount,
        uint256 _position
    ) public onlyOrganizer(_hackathonId) {
        prizeCount++;
        Prize memory newPrize = Prize({
            id: prizeCount,
            hackathonId: _hackathonId,
            title: _title,
            description: _description,
            amount: _amount,
            position: _position
        });

        hackathonPrizes[_hackathonId].push(newPrize);
        emit PrizeAdded(_hackathonId, prizeCount, _title);
    }

    function addSchedule(
        uint256 _hackathonId,
        string memory _eventName,
        string memory _description,
        uint256 _eventTime
    ) public onlyOrganizer(_hackathonId) {
        scheduleCount++;
        Schedule memory newSchedule = Schedule({
            id: scheduleCount,
            hackathonId: _hackathonId,
            eventName: _eventName,
            description: _description,
            eventTime: _eventTime
        });

        hackathonSchedules[_hackathonId].push(newSchedule);
        emit ScheduleAdded(_hackathonId, scheduleCount);
    }

    function addJudge(uint256 _hackathonId, address _judge) 
        public 
        onlyOrganizer(_hackathonId) 
    {
        hackathonJudges[_hackathonId][_judge] = true;
        emit JudgeAdded(_hackathonId, _judge);
    }

    function submitProject(
        uint256 _hackathonId,
        string memory _name,
        string memory _description,
        string memory _githubUrl,
        string memory _demoUrl,
        address[] memory _teamMembers
    ) public returns (uint256) {
        require(hackathons[_hackathonId].isActive, "Hackathon not active");
        require(block.timestamp >= hackathons[_hackathonId].startDate, "Hackathon not started");
        require(block.timestamp <= hackathons[_hackathonId].endDate, "Hackathon ended");

        projectCount++;
        Project memory newProject = Project({
            id: projectCount,
            hackathonId: _hackathonId,
            name: _name,
            description: _description,
            githubUrl: _githubUrl,
            demoUrl: _demoUrl,
            teamMembers: _teamMembers,
            submittedAt: block.timestamp
        });

        hackathonProjects[_hackathonId].push(newProject);
        emit ProjectSubmitted(projectCount, _hackathonId, _name);
        return projectCount;
    }

    function scoreProject(
        uint256 _hackathonId,
        uint256 _projectId,
        uint256 _technicalScore,
        uint256 _innovationScore,
        uint256 _presentationScore,
        uint256 _impactScore,
        string memory _feedback
    ) public onlyJudge(_hackathonId) {
        require(_technicalScore <= 100 && _innovationScore <= 100 && 
                _presentationScore <= 100 && _impactScore <= 100, "Invalid scores");

        Score memory newScore = Score({
            projectId: _projectId,
            judge: msg.sender,
            technicalScore: _technicalScore,
            innovationScore: _innovationScore,
            presentationScore: _presentationScore,
            impactScore: _impactScore,
            feedback: _feedback,
            scoredAt: block.timestamp
        });

        projectScores[_hackathonId][_projectId].push(newScore);
        emit ProjectScored(_projectId, msg.sender);
    }

    function releaseScores(uint256 _hackathonId) 
        public 
        onlyOrganizer(_hackathonId) 
    {
        scoresReleased[_hackathonId] = true;
        emit ScoresReleased(_hackathonId);
    }

    function getHackathon(uint256 _id) public view returns (Hackathon memory) {
        return hackathons[_id];
    }

    function getPrizes(uint256 _hackathonId) public view returns (Prize[] memory) {
        return hackathonPrizes[_hackathonId];
    }

    function getProjects(uint256 _hackathonId) public view returns (Project[] memory) {
        return hackathonProjects[_hackathonId];
    }

    function getSchedules(uint256 _hackathonId) public view returns (Schedule[] memory) {
        return hackathonSchedules[_hackathonId];
    }

    function getProjectScores(uint256 _hackathonId, uint256 _projectId) 
        public 
        view 
        returns (Score[] memory) 
    {
        require(
            scoresReleased[_hackathonId] || 
            hackathons[_hackathonId].organizer == msg.sender ||
            hackathonJudges[_hackathonId][msg.sender],
            "Scores not released"
        );
        return projectScores[_hackathonId][_projectId];
    }

    function isJudge(uint256 _hackathonId, address _address) 
        public 
        view 
        returns (bool) 
    {
        return hackathonJudges[_hackathonId][_address];
    }

    function areScoresReleased(uint256 _hackathonId) public view returns (bool) {
        return scoresReleased[_hackathonId];
    }
}
