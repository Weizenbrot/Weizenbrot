from django.urls import path

from . import views

app_name = "simulations"

urlpatterns = [
    path("boids/", views.boids, name="boids"),
    path("gravity/", views.gravity, name="gravity")
    #path('<int:pk>/', views.DetailView.as_view(), name='detail'),
    #path('<int:pk>/results/', views.ResultsView.as_view(), name='results'),
    #path('<int:question_id>/vote/', views.vote, name='vote'),
]