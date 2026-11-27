// Academic curriculum data

const makeSubject = (name, code = "", credits = null) => ({
  name,
  code,
  credits,
  modules: [1, 2, 3, 4, 5].map((number) => ({
    number,
    title: `Module ${number}`,
  })),
});

const firstYear2022 = {
  1: [
    makeSubject("Mathematics-1 for CSE Stream", "BMATS101"),
    // makeSubject("Applied Physics for CSE"),
  ],
  2: [
    makeSubject("Mathematics-2 for CSE Stream", "BMATS201"),
    // makeSubject("Applied Chemistry for CSE"),
  ],
};

// const commonCSESubjects2022 = {
//   3: [makeSubject("Mathematics for CSE"), makeSubject("Operating System")],
//   4: [makeSubject("ADA"), makeSubject("MC")],
//   5: [makeSubject("CN"), makeSubject("SEPM")],
//   6: [makeSubject("ML"), makeSubject("Cloud Computing")],
//   7: [makeSubject("IOT")],
// };

const curriculum = {
  2022: {
    "First Year": firstYear2022,

     CSE: {
      3: [
        makeSubject("Mathematics for Computer Science", "BCS301", 4),
        makeSubject("Digital Design & Computer Organization", "BCS302", 4),
        makeSubject("Operating Systems", "BCS303", 4),
        makeSubject("Data Structures and Applications", "BCS304", 3),
        makeSubject("Data Structures Lab", "BCSL305", 1),
        makeSubject("Social Connection and Responsibility", "BSCK307", 1),
        makeSubject("Physical Education", "BPEK359", 1),
        makeSubject("Object Oriented Programming with JAVA", "BCS306A", 3),
        makeSubject("Data Analytics with Excel", "BCS358A", 1),
        
        
      ],
      4: [
        makeSubject("Analysis & Design of Algorithms", "BCS401", 4),
        makeSubject("Microcontrollers", "BCS402", 3),
        makeSubject("Database Management Systems", "BCS403", 3),
        makeSubject("Discrete Mathematical Structures", "BCS405A", 3),
        makeSubject("Technical writing using latex", "BCSL456D", 3),
        makeSubject("Biology for Computer Engineers", "BBOC407", 2),
        makeSubject("Analysis & Design of Algorithms Lab", "BCSL404", 1),
        makeSubject("Universal Human Values Course", "BUHK408", 1),
        makeSubject("NSS", "BYOK459", 1),
      ],
      5: [
        makeSubject("Computer Networks", "BCS502", 4),
        makeSubject("Software Engineering & Project Management", "BCS501", 3),
        makeSubject("Theory of Computation", "BCS503", 3),
        makeSubject("Unix System Programming", "BCS515C", 3),
        makeSubject("Research Methodology and IPR", "BRMK557", 2),
        makeSubject("Environmental Studies and E-waste Management", "BCS508", 1),
        makeSubject("Web Technology Lab", "BCSL504", 1),
        makeSubject("Yoga", "BYOK559", 1),
      ],
      6: [
        makeSubject("Machine Learning", "BCS601", 4),
        makeSubject("Cloud Computing", "BCS613A", 3),
        makeSubject("Blockchain Technology", "BCS613B", 3),
        makeSubject("Computer Vision", "BCS613C", 3),
        makeSubject("Compiler Design", "BCS613D", 3),
        makeSubject("Advanced Java", "BCS654B", 3),
        makeSubject("Fundamental of Operating System", "BCS654C", 3),
        makeSubject("Mobile Application Development", "BCSL606", 3),
        makeSubject("Machine Learning Lab", "BCSL657D", 1),
        makeSubject("DevOps", "BIKS609", 1),
        makeSubject("Indian Knowledge System", "BYOK658", 1),
        makeSubject("NSS / Physical Education / Yoga", "BYOK658", 1),
      ],
      7: [
        makeSubject("Internet of Things", "BCS701", 4),
        makeSubject("Parallel Computing", "BCS702"), 3,
        makeSubject("Cryptography & Network Security", "BCS703", 3),
        makeSubject("Deep Learning", "BCS714A", 3),
        makeSubject("Natural Language Processing", "BCS714B"),
        makeSubject("Big Data Analytics", "BCS714D", 3),
        makeSubject("Software Engineering and Project Management", "BCS755C", 3),
      ],
    },

    AIML: {
      3: [
        makeSubject("Mathematics for Computer Science", "BCS301", 4),
      makeSubject("Digital Design & Computer Organization", "BCS302", 4),
      makeSubject("Operating Systems", "BCS303", 3),
      makeSubject("Data Structures and Applications", "BCS304", 3),
      makeSubject("Object Oriented Programming with JAVA", "BCS306-A", 3),
      makeSubject("Object Oriented Programming with C++", "BCS306-B", 3),
       makeSubject("Data Analytics with R", "BDS306-C", 3),
        makeSubject("Data Analytics with Excel", "BCS358A", 1),
         makeSubject("R Programming Lab", "BCS358B", 1),
          makeSubject("Project Management with Git", "BCS358C", 1),
           makeSubject("Data Structures Lab", "BCSL305", 1),
            makeSubject("Social Connect and Responsibility", "BSCK307", 1),
             makeSubject("Yoga", "BYOK359", 1), 
             makeSubject("Labinternals", "LAB010", 3)],

      4:[
        makeSubject("Artificial Intelligence","BCS404",3),
        makeSubject("Analysis & Design of Algorithms","BCS401",3),
        makeSubject("Microcontrollers","BCS402",3),
        makeSubject("Database Management Systems","BCS403",3),
        makeSubject("Discrete Mathematical Structures","BCS405A",3),
        makeSubject("Graph Theory","BCS405B",3),
        makeSubject("Biology for Computer Engineers","BBOC407",2),
        makeSubject("Mongodb Lab","BDSL456B",2),
        makeSubject("Linear Algebra","BCS405D",1),
        makeSubject("Green IT and Sustainability","BCS456A",1),
        makeSubject("Capacity Planning for IT","BCS456B",1),
        makeSubject("Analysis & Design of Algorithms Lab","BCSL404",1),
        makeSubject("Universal Human Values Course","BUHK408",1),
        makeSubject("NSS / Physical Education / Yoga","BYOK459",1)
      ],

      5:[
  makeSubject("Computer Networks","BCS502",4),
  makeSubject("Computer Vision","BAI515A",3),
  makeSubject("Informational Retrieval","BAI515B",3),
  makeSubject("Exploratory Data Analysis","BAI515E",3),
  makeSubject("Software Engineering & Project Management","BCS501",3),
  makeSubject("Theory of Computation","BCS503",3),
  makeSubject("Research Methodology and IPR","BRMK557",2),
  makeSubject("Data Visualization Lab","BAIL504",1),
  makeSubject("Environmental Studies and E-waste Management","BCS508",1),
  makeSubject("NSS / Physical Education / Yoga","BYOK559",1)
],
      6:  [
  makeSubject("Machine Learning", "BAI602", 4),
  makeSubject("Natural Language Processing", "BAI601", 3),
  makeSubject("Human Centred AI", "BAI613A", 3),
  makeSubject("Open Elective Course - I", "BAI654x", 3),
  makeSubject("Generative AI", "BAIL657C", 1),
  makeSubject("Indian Knowledge System", "BIKS609", 1),
  makeSubject("NSS / Physical Education / Yoga", "BYOK658", 1)
],
    },

    ECE: {
      3:[
  makeSubject("Digital System Design using Verilog", "BEC302", 4),
  makeSubject("Electronic Principles and Circuits", "BEC303", 3),
  makeSubject("Network Analysis", "BEC304", 3),
  makeSubject("Computer Organization and Architecture", "BEC306C", 3),
  makeSubject("AV Mathematics-III for EC Engineering", "BMATEC301", 3),
  makeSubject("MATLAB Programming", "BEC358B", 1),
  makeSubject("Analog and Digital Systems Design Laboratory", "BECL305", 1),
  makeSubject("Social Connect and Responsibility", "BSCK307", 1),
  makeSubject("Yoga", "BYOK359", 1)
],
      4:  [
  makeSubject("Principles of Communication Systems", "BEC402", 4),
  makeSubject("Electromagnetic Theory", "BEC401", 3),
  makeSubject("Control Systems", "BEC403", 3),
  makeSubject("Microcontrollers", "BEC405A", 3),
  makeSubject("Operating Systems", "BEC405C", 3),
  makeSubject("Biology For Engineers", "BBOK407", 2),
  makeSubject("Programmable Logic Controller", "BEC456B", 1),
  makeSubject("Communication Laboratory", "BECL404", 1),
  makeSubject("Microcontroller Lab", "BECL456A", 1),
  makeSubject("Universal Human Values Course", "BUHK408", 1),
  makeSubject("NSS / Physical Education / Yoga", "BYOK459", 1)
],
      5:  [
  makeSubject("Digital Signal Processing", "BEC502", 4),
  makeSubject("Technological Innovation and Management Entrepreneurship", "BEC501", 3),
  makeSubject("Digital Communication", "BEC503", 3),
  makeSubject("Data Structures using C++", "BEC515C", 3),
  makeSubject("Research Methodology and IPR", "BRMK557", 2),
  makeSubject("Digital Communication Lab", "BECL504", 1),
  makeSubject("Environmental Studies", "BESK508", 1),
  makeSubject("NSS / Physical Education / Yoga", "BYOK559", 1)
],
      6: [
  makeSubject("VLSI Design and Testing", "BEC602", 4),
  makeSubject("Embedded System Design", "BEC601", 3),
  makeSubject("Multimedia Communication", "BEC613A", 3),
  makeSubject("Digital Image Processing", "BEC613C", 3),
  makeSubject("FPGA based system design using verilog", "BEC613D", 3),
  makeSubject("Consumer Electronics", "BEC654B", 3),
  makeSubject("Electronic Communication system", "BEC654C", 1),
  makeSubject("Internet Of Things lab", "BECL657C", 1),
  makeSubject("Indian Knowledge System", "BIKS609", 1),
  makeSubject("NSS / Physical Education / Yoga", "BYOK658", 1)
],
      7: [
  makeSubject("Computer Networks and Protocols", "BEC702", 4),
  makeSubject("Microwave Engineering and Antenna Theory", "BEC701", 3),
  makeSubject("Wireless Communication Systems", "BEC703", 3),
  makeSubject("APPLICATION SPECIFIC INTEGRATED CIRCUIT", "BEC714A", 3),
  makeSubject("AUTOMATIVE ELECTRONICS", "BEC714C", 3),
  makeSubject("AUTOMATIVE ELECTRONICS", "BEC755B", 3),
  makeSubject("Embedded System Applications", "BEC755C", 3)
],
    },

    Civil: {
      3: [
  makeSubject("Engineering Survey", "BCV302", 4),
  makeSubject("Strength of Materials", "BCV301", 3),
  makeSubject("Engineering Geology", "BCV303", 3),
  makeSubject("Water Supply and Waste water Engineering", "BCV304", 3),
  makeSubject("RURAL, URBAN PLANNING AND ARCHITECTURE", "BCV306A", 3),
  makeSubject("SUSTAINABLE DESIGN CONCEPT FOR BUILDING SERVICES", "BCV306C", 3),
  makeSubject("Fire Safety in Buildings", "BCV306D-", 3),
  makeSubject("Computer Aided Building Planning and Drawing", "BCV305", 1),
  makeSubject("Data Analytics with Excel", "BCV358A", 1),
  makeSubject("Social Connect and Responsibility", "BSCK307", 1),
  makeSubject("Yoga", "BYOK359", 1)
],
      4: [
  makeSubject("Fluid Mechanics and Hydraulics", "BCV402", 4),
  makeSubject("Analysis of Structures", "BCV401", 3),
  makeSubject("Transportation Engineering", "BCV403", 3),
  makeSubject("Watershed Management", "BCV405D", 3),
  makeSubject("Biology For Engineers", "BBOK407", 2),
  makeSubject("Electronic Waste Management-Issues and Challenges", "BCV456C", 1),
  makeSubject("Building Materials Testing Lab", "BCVL404", 1),
  makeSubject("Universal Human Values Course", "BUHK408", 1),
  makeSubject("NSS / Physical Education / Yoga", "BYOK459", 1)
],
      5:[
  makeSubject("Geotechnical Engineering", "BCV502", 4),
  makeSubject("Construction Management and Entrepreneurship", "BCV501", 3),
  makeSubject("Concrete Technology", "BCV503", 3),
  makeSubject("Professional Elective Course - III", "BCV515x", 3),
  makeSubject("Research Methodology and IPR", "BRMK557", 2),
  makeSubject("Environmental Studies", "BESK508", 1),
  makeSubject("NSS / Physical Education / Yoga", "BYOK559", 1)
],
      6:[
  makeSubject("Irrigation Engineering and Hydraulic Structures", "BCV602", 4),
  makeSubject("Design of RCC Structures", "BCV601", 3),
  makeSubject("Applied Geotechnical Engineering", "BCV613C", 3),
  makeSubject("Water Conservation And Rain Water Harvesting", "BCV654A", 3),
  makeSubject("Geographic-Information-Systems", "BCV654B", 3),
  makeSubject("Integrated Waste Management For a smart City", "BCV654C", 1),
  makeSubject("Software Application Lab", "BCVL606", 1),
  makeSubject("Indian Knowledge System", "BIKS609", 1),
  makeSubject("NSS / Physical Education / Yoga", "BYOK658", 1)
],

      7: [
  makeSubject("Design of Steel Structures", "BCV701", 3),
  makeSubject("Prestressed Concrete", "BCV703", 3)
],
    },

    Mechanical: {
      3: [
  makeSubject("Material Science and Metallurgy", "BME302", 4),
  makeSubject("Engineering Thermodynamics", "BME301", 3),
  makeSubject("Mechanics of Materials", "BME303", 3),
  makeSubject("Manufacturing Processes", "BME304", 3),
  makeSubject("Electrical And Hybrid Vehicle Technology", "BME306A", 3),
  makeSubject("Smart Materials and Systems", "BME306B", 3),
  makeSubject("Internet of Things", "BME306C", 3),
  makeSubject("Computer Aided Machine Drawing", "BMEL305", 1),
  makeSubject("Social Connect and Responsibility", "BSCK307", 1),
  makeSubject("Yoga", "BYOK359", 1)
],
      4: [
  makeSubject("Fluid Mechanics", "BME402", 4),
  makeSubject("Theory of Machines", "BME401", 3),
  makeSubject("Applied Thermodynamics", "BME403", 3),
  makeSubject("Non Traditional Machining", "BME405A", 3),
  makeSubject("Robotics and Automation", "BME405D", 3),
  makeSubject("Biology For Engineers", "BBOK407", 2),
  makeSubject("Material Testing & Metrology Lab", "BMEL404", 1),
  makeSubject("Introduction To AI & ML", "BMEL456A", 1),
  makeSubject("Universal Human Values Course", "BUHK408", 1),
  makeSubject("NSS / Physical Education / Yoga", "BYOK459", 1)
],
      5:[
  makeSubject("Turbomachines", "BME502", 4),
  makeSubject("Industrial Management & Entrepreneurship", "BME501", 3),
  makeSubject("Theory of Machines", "BME503", 3),
  makeSubject("Automation in Manufacturing", "BME515B", 3),
  makeSubject("Research Methodology and IPR", "BRMK557", 2),
  makeSubject("Environmental Studies", "BESK508", 1),
  makeSubject("NSS / Physical Education / Yoga", "BYOK559", 1)
],
      6:[
  makeSubject("Heat Transfer", "BME601", 4),
  makeSubject("Machine Design", "BME602", 3),
  makeSubject("Total Quality Management", "BME613A", 3),
  makeSubject("Project Management", "BME654A", 3),
  makeSubject("Indian Knowledge System", "BIKS609", 1),
  makeSubject("Renewable Energy Power Plants", "BME654B", 1),
  makeSubject("NSS / Physical Education / Yoga", "BYOK658", 1)
],
      7: [
  makeSubject("Hydraulics and Pneumatics", "BME702", 4),
  makeSubject("Finite Element Methods", "BME701", 3),
  makeSubject("Control Engineering", "BME703", 3),
  makeSubject("Additive Manufacturing", "BME714A", 3)
],
    },
  },


   2025: {
    "First Year": {
      1: [
  makeSubject("Differential Calculus And Linear Algebra: CV Stream", "1BMATC101", 4),
  makeSubject("Differential Calculus And Linear Algebra: EEE stream", "1BMATE101", 4),
  makeSubject("Differential Calculus and Linear Algebra: ME Stream", "1BMATM101", 4),
  makeSubject("Calculus and Linear Algebra: CSE Stream", "1BMATS101", 4),
  makeSubject("PYTHON PROGRAMMING", "1BPLC105B-205B", 4),
  makeSubject("INTRODUCTION TO C PROGRAMMING", "1BPLC205E-105E", 4),
  makeSubject("Introduction to AI and its Applications", "1BAIA103", 3),
  makeSubject("Computer Aided Engineering and Drawing", "1BCEDS103", 3),
  makeSubject("Applied Chemistry for Emerging Electronics and Futuristic Devices (EEE ECE)", "1BCHEE102-202", 3),
  makeSubject("Applied Chemistry for Advanced Metal Protection and Sustainable Energy Systems (ME)", "1BCHEM102-202", 3),
  makeSubject("Applied Chemistry for Smart Systems (CSE)", "1BCHES102-202", 3),
  makeSubject("Programming in C", "1BEIT105", 3),
  makeSubject("Building Sciences & Mechanics", "1BESC104A-204A", 3),
  makeSubject("Introduction to Electrical Engineering", "1BESC104B-204B", 3),
  makeSubject("Introduction to Electronics & Communication Engineering", "1BESC104C-204C", 3),
  makeSubject("Introduction to Mechanical Engineering", "1BESC104D-204D", 3),
  makeSubject("Quantum Physics and Applications (CSE stream)", "1BPHYS102-202", 3),
  makeSubject("Problem Solving Through Programming", "1BPSP105", 3),
  makeSubject("Balake Kannada", "1BKBK109", 1),
  makeSubject("Samskrutika Kannada", "1BKSK109", 1)
],
    },

    CSE: {
      3: [
        makeSubject("Probability, Distributions and Statistics", "1BMATCS301",4),
        makeSubject("Digital Design & Computer Organization", "1BCS303",4),
        makeSubject("Operating Systems", "1BCS304",3),
        makeSubject("Data Structures and Applications", "1BCS305",3),
        makeSubject("Object Oriented Programming with JAVA", "1BCS302 ",4),
        makeSubject("Yoga", "BYOK359",1),
        makeSubject("Data Structures Lab", "1BCSL306",1),
        makeSubject("Project Management (with Git)", "1BCSL307A",1),
        makeSubject("Community Project / Societal Project (Project-Based Learning) ", "1BCP308",1)
        // makeSubject("Social Connect and Responsibility", "BSCK307"),
      ],
      4: [
        makeSubject("Analysis & Design of Algorithms", "BCS401"),
        makeSubject("Microcontrollers", "BCS402"),
        makeSubject("Database Management Systems", "BCS403"),
        makeSubject("Discrete Mathematical Structures", "BCS405A"),
        makeSubject("Technical writing using latex", "BCSL456D"),
        makeSubject("Biology for Computer Engineers", "BBOC407"),
        makeSubject("Analysis & Design of Algorithms Lab", "BCSL404"),
        makeSubject("Universal Human Values Course", "BUHK408"),
        makeSubject("Universal Human Values Course", "BUHK408"),
        makeSubject("NSS", "BYOK459"),
      ],
      5: [
        makeSubject("Computer Networks", "BCS502"),
        makeSubject("Software Engineering & Project Management", "BCS501"),
        makeSubject("Theory of Computation", "BCS503"),
        makeSubject("Unix System Programming", "BCS515C"),
        makeSubject("Research Methodology and IPR", "BRMK557"),
        makeSubject("Environmental Studies and E-waste Management", "BCS508"),
        makeSubject("Web Technology Lab", "BCSL504"),
        makeSubject("Yoga", "BYOK559"),
      ],
      6: [
        makeSubject("Machine Learning", "BCS601"),
        makeSubject("Cloud Computing", "BCS613A"),
        makeSubject("Blockchain Technology", "BCS613B"),
        makeSubject("Computer Vision", "BCS613C"),
        makeSubject("Compiler Design", "BCS613D"),
        makeSubject("Advanced Java", "BCS654B"),
        makeSubject("Fundamental of Operating System", "BCS654C"),
        makeSubject("Mobile Application Development", "BCSL606"),
        makeSubject("Machine Learning Lab", "BCSL657D"),
        makeSubject("DevOps", "BIKS609"),
        makeSubject("Indian Knowledge System", "BYOK658"),
        makeSubject("NSS / Physical Education / Yoga", "BYOK658"),
      ],
      7: [
        makeSubject("Internet of Things", "BCS701"),
        makeSubject("Parallel Computing", "BCS702"),
        makeSubject("Cryptography & Network Security", "BCS703"),
        makeSubject("Deep Learning", "BCS714A"),
        makeSubject("Natural Language Processing", "BCS714B"),
        makeSubject("Big Data Analytics", "BCS714D"),
        makeSubject("Software Engineering and Project Management", "BCS755C"),
      ],
    },

    AIML: {
      3: [
        makeSubject("Mathematics for Computer Science", "BCS301"),
        makeSubject("Digital Design & Computer Organization", "BCS302"),
        makeSubject("Operating Systems", "BCS303"),
        makeSubject("Data Structures and Applications", "BCS304"),
        makeSubject("Object Oriented Programming with JAVA", "BCS306-A"),
        makeSubject("Yoga", "BYOK359"),
      ],
      4: [
        makeSubject("Analysis & Design of Algorithms", "BCS401"),
        makeSubject("Microcontrollers", "BCS402"),
        makeSubject("Database Management Systems", "BCS403"),
        makeSubject("Discrete Mathematical Structures", "BCS405A"),
        makeSubject("Technical writing using latex", "BCSL456D"),
        makeSubject("Biology for Computer Engineers", "BBOC407"),
        makeSubject("Analysis & Design of Algorithms Lab", "BCSL404"),
        makeSubject("Universal Human Values Course", "BUHK408"),
        makeSubject("Universal Human Values Course", "BUHK408"),
        makeSubject("NSS", "BYOK459"),
      ],
      5: [
        makeSubject("Computer Networks", "BCS502"),
        makeSubject("Software Engineering & Project Management", "BCS501"),
        makeSubject("Theory of Computation", "BCS503"),
        makeSubject("Unix System Programming", "BCS515C"),
        makeSubject("Research Methodology and IPR", "BRMK557"),
        makeSubject("Environmental Studies and E-waste Management", "BCS508"),
        makeSubject("Data Visualization Lab", "BAIL504"),
        makeSubject("Yoga", "BYOK559"),
      ],
      6: [
        makeSubject("Machine Learning", "BAI602"),
        makeSubject("Natural Language Processing", "BAI601"),
        makeSubject("Human Centred AI", "BAI613A"),
        makeSubject("Open Elective Course - I", "BAI654x"),
        makeSubject("Generative AI", "BAIL657C"),
        makeSubject("Indian Knowledge System", "BIKS609"),
        makeSubject("NSS / Physical Education / Yoga", "BYOK658"),
      ],
    },

    ECE: {
      3: [
        makeSubject("Digital System Design using Verilog", "BEC302"),
        makeSubject("Electronic Principles and Circuits", "BEC303"),
        makeSubject("Network Analysis", "BEC304"),
        makeSubject("Computer Organization and Architecture", "BEC306C"),
        makeSubject("AV Mathematics-III for EC Engineering", "BMATEC301"),
        makeSubject("MATLAB Programming (BEC358B)", "BEC358B"),
        makeSubject("Analog and Digital Systems Design Laboratory", "BECL305"),
        makeSubject("Social Connect and Responsibility", "BSCK307"),
        makeSubject("Yoga", "BYOK359"),
      ],
      4: [
        makeSubject("Principles of Communication Systems", "BEC402"),
        makeSubject("Electromagnetic Theory", "BEC401"),
        makeSubject("Control Systems", "BEC403"),
        makeSubject("Microcontrollers", "BEC405A"),
        makeSubject("Operating Systems", "BEC405C"),
        makeSubject("Biology For Engineers", "BBOK407"),
        makeSubject("Programmable Logic Controller", "BEC456B"),
        makeSubject("Communication Laboratory", "BECL404"),
        makeSubject("Microcontroller Lab", "BECL456A"),
        makeSubject("Universal Human Values Course", "BUHK408"),
        makeSubject("NSS / Physical Education / Yoga", "BYOK459"),
      ],
      5: [
        makeSubject("Digital Signal Processing", "BEC502"),
        makeSubject(
          "Technological Innovation and Management Entrepreneurship",
          "BEC501",
        ),
        makeSubject("Digital Communication", "BEC503"),
        makeSubject("Data Structures using C++", "BEC515C"),
        makeSubject("Research Methodology and IPR", "BRMK557"),
        makeSubject("Digital Communication Lab", "BECL504"),
        makeSubject("Environmental Studies", "BESK508"),
        makeSubject("NSS / Physical Education / Yoga", "BYOK559"),
      ],
      6: [
        makeSubject("VLSI Design and Testing", "BEC602"),
        makeSubject("Embedded System Design", "BEC601"),
        makeSubject("Multimedia Communication", "BEC613A"),
        makeSubject("Digital Image Processing", "BEC613C"),
        makeSubject("FPGA based system design using verilog", "BEC613D"),
        makeSubject("Consumer Electronics", "BEC654B"),
        makeSubject("Electronic Communication system", "BEC654C"),
        makeSubject("Internet Of Things lab", "BECL657C"),
        makeSubject("Indian Knowledge System", "BIKS609"),
        makeSubject("NSS / Physical Education / Yoga", "BYOK658"),
      ],
      7: [
        makeSubject("Computer Networks and Protocols", "BEC702"),
        makeSubject("Microwave Engineering and Antenna Theory", "BEC701"),
        makeSubject("Wireless Communication Systems", "BEC703"),
        makeSubject("Application Specific Integrated Circuit", "BEC714A"),
        makeSubject("Automative Electronics", "BEC714C"),
        makeSubject("Automative Electronics", "BEC755B"),
        makeSubject("Embedded System Applications", "BEC755C"),
      ],
    },

    Civil: {
      3: [
        makeSubject("Engineering Survey", "BCV302"),
        makeSubject("Strength of Materials", "BCV301"),
        makeSubject("Engineering Geology", "BCV303"),
        makeSubject("Water Supply and Waste water Engineering", "BCV304"),
        makeSubject("RURAL, URBAN PLANNING AND ARCHITECTURE", "BCV306A"),
        makeSubject(
          "SUSTAINABLE DESIGN CONCEPT FOR BUILDING SERVICES",
          "BCV306C",
        ),
        makeSubject("Fire Safety in Buildings", "BCV306D-"),
        makeSubject("Computer Aided Building Planning and Drawing", "BCV305"),
        makeSubject("Data Analytics with Excel (BCV358A)", "BCV358A"),
        makeSubject("Social Connect and Responsibility", "BSCK307"),
        makeSubject("Yoga", "BYOK359"),
      ],
      4: [
        makeSubject("Fluid Mechanics and Hydraulics", "BCV402"),
        makeSubject("Analysis of Structures", "BCV401"),
        makeSubject("Transportation Engineering", "BCV403"),
        makeSubject("Watershed Management", "BCV405D"),
        makeSubject("Biology For Engineers", "BBOK407"),
        makeSubject(
          "Electronic Waste Management-Issues and Challenges",
          "BCV456C",
        ),
        makeSubject("Building Materials Testing Lab", "BCVL404"),
        makeSubject("Universal Human Values Course", "BUHK408"),
        makeSubject("NSS / Physical Education / Yoga", "BYOK459"),
      ],
      5: [
        makeSubject("Geotechnical Engineering", "BCV502"),
        makeSubject("Construction Management and Entrepreneurship", "BCV501"),
        makeSubject("Concrete Technology", "BCV503"),
        makeSubject("Professional Elective Course - III", "BCV515x"),
        makeSubject("Research Methodology and IPR", "BRMK557"),
        makeSubject("Environmental Studies", "BESK508"),
        makeSubject("NSS / Physical Education / Yoga", "BYOK559"),
      ],
      6: [
        makeSubject(
          "Irrigation Engineering and Hydraulic Structures",
          "BCV602",
        ),
        makeSubject("Design of RCC Structures", "BCV601"),
        makeSubject("Applied Geotechnical Engineering", "BCV613C"),
        makeSubject("Water Conservation And Rain Water Harvesting", "BCV654A"),
        makeSubject("Geographic-Information-Systems", "BCV654B"),
        makeSubject("Integrated Waste Management For a smart City", "BCV654C"),
        makeSubject("Software Application Lab", "BCVL606"),
        makeSubject("Indian Knowledge System", "BIKS609"),
        makeSubject("NSS / Physical Education / Yoga", "BYOK658"),
      ],
      7: [
        makeSubject("Design of Steel Structures", "BCV701"),
        makeSubject("Prestressed Concrete", "BCV703"),
      ],
    },

    Mechanical: {
      3: [
        makeSubject("Material Science and Metallurgy", "BME302"),
        makeSubject("Engineering Thermodynamics", "BME301"),
        makeSubject("Mechanics of Materials", "BME303"),
        makeSubject("Manufacturing Processes", "BME304"),
        makeSubject("Electrical And Hybrid Vehicle Technology", "BME306A"),
        makeSubject("Smart Materials and Systems", "BME306B"),
        makeSubject("Internet of Things", "BME306C"),
        makeSubject("Computer Aided Machine Drawing", "BMEL305"),
        makeSubject("Social Connect and Responsibility", "BSCK307"),
        makeSubject("Yoga", "BYOK359"),
      ],
      4: [
        makeSubject("Fluid Mechanics", "BME402"),
        makeSubject("Theory of Machines", "BME401"),
        makeSubject("Applied Thermodynamics", "BME403"),
        makeSubject("Non Traditional Machining", "BME405A"),
        makeSubject("Robotics and Automation", "BME405D"),
        makeSubject("Biology For Engineers", "BBOK407"),
        makeSubject("Material Testing & Metrology Lab", "BMEL404"),
        makeSubject("Introduction To AI & ML", "BMEL456A"),
        makeSubject("Universal Human Values Course", "BUHK408"),
        makeSubject("NSS / Physical Education / Yoga", "BYOK459"),
      ],
      5: [
        makeSubject("Turbomachines", "BME502"),
        makeSubject("Industrial Management & Entrepreneurship", "BME501"),
        makeSubject("Theory of Machines", "BME503"),
        makeSubject("Automation in Manufacturing", "BME515B"),
        makeSubject("Research Methodology and IPR", "BRMK557"),
        makeSubject("Environmental Studies", "BESK508"),
        makeSubject("NSS / Physical Education / Yoga", "BYOK559"),
      ],
      6: [
        makeSubject("Heat Transfer", "BME601"),
        makeSubject("Machine Design", "BME602"),
        makeSubject("Total Quality Management", "BME613A"),
        makeSubject("Project Management", "BME654A"),
        makeSubject("Indian Knowledge System", "BIKS609"),
        makeSubject("Renewable Energy Power Plants", "BME654B"),
        makeSubject("NSS / Physical Education / Yoga", "BYOK658"),
      ],
      7: [
        makeSubject("Hydraulics and Pneumatics", "BME702"),
        makeSubject("Finite Element Methods", "BME701"),
        makeSubject("Control Engineering", "BME703"),
        makeSubject("Additive Manufacturing", "BME714A"),
      ],
    },
  },
};

export const branches = [
  "First Year",
  "CSE",
  "AIML",
  "ECE",
  "Civil",
  "Mechanical",
];

export const getSubjects = (scheme, branch, semester) => {
  const branchMap = {
    "FIRST YEAR": "First Year",
    CSE: "CSE",
    AIML: "AIML",
    ECE: "ECE",
    CIVIL: "Civil",
    MECHANICAL: "Mechanical",
  };

  const normalizedBranch = branchMap[branch?.trim().toUpperCase()];

  if (!normalizedBranch || !curriculum[scheme]) {
    return [];
  }

  return curriculum[scheme][normalizedBranch]?.[Number(semester)] || [];
};

export default curriculum;
