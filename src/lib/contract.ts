
    export const AnalyticsContract = `
    local function _load()
    local dbAdmin = {}
    dbAdmin.__index = dbAdmin 
    -- Function to create a new database explorer instance
    function dbAdmin.new(db)
        local self = setmetatable({}, dbAdmin)
       
        self.db = db
        return self
    end
    
    -- Function to list all tables in the database
    function dbAdmin:tables()
        local tables = {}
        for row in self.db:nrows("SELECT name FROM sqlite_master WHERE type='table';") do
            table.insert(tables, row.name)
        end
        return tables
    end
    
    -- Function to get the record count of a table
    function dbAdmin:count(tableName)
        local count_query = string.format("SELECT COUNT(*) AS count FROM %s;", tableName)
        for row in self.db:nrows(count_query) do
            return row.count
        end
    end
    -- funktion to read tables data
    function dbAdmin:readTable(tableName)
        local query = string.format("SELECT * FROM %s;", tableName)
        local results = {}
        for row in self.db:nrows(query) do
            table.insert(results, row)
        end
        return results
    end
    -- Function to execute a given SQL query
    function dbAdmin:exec(sql)
        local results = {}
        for row in self.db:nrows(sql) do
            table.insert(results, row)
        end
        return results
    end
    
    return dbAdmin
    end
    
    _G.package.loaded["DbAdmin"] = _load()
    
    _G.package.loaded["DbAdmin"] = _load()

    local sqlite3 = require('lsqlite3')
    db = db or sqlite3.open_memory()
    dbAdmin = require('DbAdmin').new(db)
    
    VISITORS_TABLE = [[
      CREATE TABLE IF NOT EXISTS visitors (
        month TEXT,
        page TEXT,
        count INTEGER DEFAULT 0,
        PRIMARY KEY (month, page)
      );
    ]]
    
    function InitDb() 
      db:exec(VISITORS_TABLE)
      -- Initialize all months with zero count for a default page
      local months = {"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"}
      for _, month in ipairs(months) do
        db:exec(string.format([[
          INSERT OR IGNORE INTO visitors (month, page, count) VALUES ("%s", "/", 0);
        ]], month))
      end
      return dbAdmin:tables()
    end
    
    InitDb()
    Handlers.add("Analytics.IncrementVisitor",
  function (msg)
    return msg.Action == "Analytics.IncrementVisitor"
  end,
  function (msg)
    print("Handler triggered for Analytics.IncrementVisitor")
    print("Received message: " .. require('json').encode(msg))

    local month = msg.Month
    local page = msg.Page

    print("Received month: " .. tostring(month))
    print("Received page: " .. tostring(page))

    if not month or not page then
      print("Month or Page is missing")
      Send({Target = msg.From, Action = "Analytics.Error", Data = "Month and Page are required"})
      return "Month and Page are required"
    end

    print("Incrementing visitor count for " .. month .. " on page " .. page)
    local result = dbAdmin:exec(string.format([[
      INSERT INTO visitors (month, page, count) 
      VALUES ("%s", "%s", 1) 
      ON CONFLICT(month, page) DO UPDATE SET count = count + 1;
    ]], month, page))
    print("Update result: " .. tostring(#result))

    print("Sending confirmation message")
    Send({
      Target = msg.From,
      Action = "Analytics.VisitorIncremented",
      Data = "Visitor count incremented for " .. month .. " on page " .. page
    })
    print("Confirmation sent to " .. tostring(msg.From))
  end 
)
   Handlers.add("Analytics.GetAllCounts",
      function (msg)
        return msg.Action == "Analytics.GetAllCounts"
      end,
      function (msg)
        print("Handler triggered for Analytics.GetAllCounts")
    
        local results = dbAdmin:readTable("visitors")
        local monthlyCounts = {}
        local pageCounts = {}
        local allTimeCount = 0
    
        for _, row in ipairs(results) do
          -- Monthly counts
          monthlyCounts[row.month] = (monthlyCounts[row.month] or 0) + row.count
          
          -- Page counts
          pageCounts[row.page] = (pageCounts[row.page] or 0) + row.count
          
          -- All time count
          allTimeCount = allTimeCount + row.count
        end
    
        local response = {
          monthlyCounts = monthlyCounts,
          pageCounts = pageCounts,
          allTimeCount = allTimeCount
        }
    
        print("Sending counts to " .. tostring(msg.From))
        Send({
          Target = msg.From,
          Action = "Analytics.AllCounts",
          Data = require('json').encode(response)
        })
      end
    )

    return "OKkkrrrr"`;

   