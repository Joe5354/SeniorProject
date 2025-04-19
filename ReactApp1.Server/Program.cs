using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Controllers;
using ReactApp1.Server.Models;
using System.Threading;
using Microsoft.AspNetCore.Identity;

var builder = WebApplication.CreateBuilder(args);

// Add CORS services
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy.WithOrigins("http://localhost:58565")  // Allow the React app on this URL
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials());
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader());
});

// Add services to the container
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<IdealDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("IdealDbConnection")));


builder.Services.AddDbContext<parDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("ParDbConnection"))
           .EnableSensitiveDataLogging()  // Enables detailed query logging for debugging
           .LogTo(Console.WriteLine, LogLevel.Information)
);
builder.Services.AddScoped<IdealInventoryViewController>();  // Register the controller

var app = builder.Build();

// Apply CORS middleware
app.UseCors("AllowAll");
app.UseCors("AllowReactApp");

app.UseDefaultFiles();
app.UseStaticFiles();



// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

/*// Populate Items table on startup
using (var scope = app.Services.CreateScope())
{
    var Idealcontroller = scope.ServiceProvider.GetRequiredService<IdealInventoryViewController>();
    var idealContext = scope.ServiceProvider.GetRequiredService<IdealDbContext>();
    // Run the PopulateItems function
    List<VwItemInventory> invItems = await idealContext.VwItemInventories.ToListAsync();
    foreach (var idealItem in invItems) 
    { 
        await Idealcontroller.PushItem(idealItem.ItemId, idealItem);
    }
}*/

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("/index.html");

//map endpoints

app.MapUserEndpoints();

app.MapParNoteEndpoints();

app.MapItemEndpoints();

app.MapParRuleEndpoints();

app.MapUserRoleEndpoints();


app.Run();
