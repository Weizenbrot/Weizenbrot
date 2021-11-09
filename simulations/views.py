from django.shortcuts import render

# Create your views here.

def boids(request):
    return render(request, "simulations/boids.html")

def gravity(request):
    return render(request, "simulations/gravity.html")
