use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use csv::ReaderBuilder;
use std::fs::File;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Debug, Deserialize, Serialize, Clone)]
struct Point {
    project_link: String,
    full_desc: String,
    title_project: String,
    brief_desc: String,
    prize: String,
    title_hackathon: String,
    end_date: String,
    x: f64,
    y: f64,
}

#[derive(Deserialize)]
struct QueryParams {
    min_x: f64,
    max_x: f64,
    min_y: f64,
    max_y: f64,
}

struct AppState {
    points: Mutex<Vec<Point>>,
}

async fn get_points(data: web::Data<AppState>, query: web::Query<QueryParams>) -> impl Responder {
    let points = data.points.lock().unwrap();

    let filtered_points: Vec<&Point> = points.iter().filter(|point| {
            point.x >= query.min_x && point.x <= query.max_x && point.y >= query.min_y && point.y <= query.max_y
        })
        .collect();

    HttpResponse::Ok().json(filtered_points)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let file = File::open("points.csv").expect("Could not open file");
    let mut rdr = ReaderBuilder::new().has_headers(true).from_reader(file);

    let points: Vec<Point> = rdr
        .deserialize()
        .filter_map(Result::ok)
        .collect();

    let app_state = web::Data::new(AppState {
        points: Mutex::new(points),
    });

    HttpServer::new(move || {
        App::new()
            .app_data(app_state.clone())
            .route("/get_points/", web::get().to(get_points))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}